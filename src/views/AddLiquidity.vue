<template>
  <MainWrapper
    title="Add Liquidity"
    back-button
    settings
    class="add-liquidity"
  >
    <Tip
      :tip="`When you add liquidity, you will receive pool tokens representing your position.
      These tokens automatically earn fees proportional
      to your share of the pool, and can be redeemed at any time.`"
    />
    <InputToken
      :value="amountFrom"
      :token="from"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balanceFrom = $event"
    />
    <img src="../assets/plus.svg">
    <InputToken
      :value="amountTo"
      :token="to"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
      @update:balance="balanceTo = $event"
    />

    <div
      v-if="to && from"
      class="pool-info"
    >
      <div class="header">
        Prices and pool share
      </div>
      <div class="body">
        <div>
          <span>
            {{ ratio ?? '-' }}
          </span>
          <span class="second">
            {{ `${to.symbol} per ${from.symbol}` }}
          </span>
        </div>
        <div>
          <span>
            {{ ratio ? 1 / ratio: '-' }}
          </span>
          <span class="second">
            {{ `${from.symbol} per ${to.symbol}` }}
          </span>
        </div>
        <div>
          <span>
            {{ share ? share.toFixed(8) : '0.00000000' }} %
          </span>
          <span class="second">
            Share of Pool
          </span>
        </div>
      </div>
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      :disabled="isApproved"
      @click="approve"
    >
      {{ isApproved ? 'Approved' : 'Approve' }}
    </ButtonDefault>
    <ButtonDefault
      :fill="address ? 'blue' : 'transparent-blue'"
      :disabled="isDisabled"
      :spinner="loading"
      :class="{ loading }"
      @click="clickHandler"
    >
      {{ buttonMessage }}
    </ButtonDefault>
  </MainWrapper>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import Tip from '@/components/Tip.vue';
import MainWrapper from '@/components/MainWrapper.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import { calculateSelectedToken, handleUnknownError } from '../lib/utils';

const WAE = process.env.VUE_APP_WAE_ADDRESS;
const reduceDecimals = (val, token) => BigNumber(val)
  .div(BigNumber(10).pow(token.decimals));
const expandDecimals = (val, token) => BigInt(BigNumber(10)
  .pow(token.decimals).times(val).toFixed());

// TODO: this is what uniswap uses as minimumLiquidity, let's decide on it
const minimumLiquidity = 1000n;

export default {
  components: {
    Tip,
    MainWrapper,
    InputToken,
    ButtonDefault,
  },
  data: () => ({
    loading: false,
    to: null,
    from: null,
    amountFrom: '',
    amountTo: '',
    isLastAmountFrom: true,
    totalSupply: null,
    balanceFrom: null,
    balanceTo: null,
    allowanceFrom: 0,
    allowanceTo: null,
    reserveFrom: null,
    reserveTo: null,

  }),
  computed: {
    ...mapState({
      address: 'address',
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    liquidity() {
      if (!this.from
          || !this.to
          || !this.amountFrom
          || !this.amountTo
      ) {
        return 0;
      }
      const { totalSupply } = this;
      const amountFrom = expandDecimals(this.amountFrom, this.from);
      const amountTo = expandDecimals(this.amountTo, this.to);

      // if there is no pair yet we have a special
      // case for the first provided liquidity
      if (!this.reserveFrom || !this.reserveTo || !totalSupply) {
        return BigNumber(amountFrom)
          .times(amountTo)
          .sqrt()
          .minus(minimumLiquidity);
      }
      const liquidityFrom = (amountFrom * totalSupply) / this.reserveFrom;
      const liquidityTo = (amountTo * totalSupply) / this.reserveTo;
      return liquidityFrom < liquidityTo ? liquidityFrom : liquidityTo;
    },
    share() {
      if (!this.totalSupply && this.amountFrom && this.amountTo) {
        return 100;
      }
      if (!this.reserveFrom
          || !this.reserveTo
          || !this.from
          || !this.to
          || !this.amountFrom
          || !this.amountTo
      ) {
        return null;
      }
      const amountFrom = expandDecimals(this.amountFrom, this.from);
      const amountTo = expandDecimals(this.amountTo, this.to);
      const amount = amountFrom * amountTo;
      const reserve = this.reserveTo * this.reserveFrom;
      return BigNumber(amount).times(100).div(reserve).toNumber();
    },
    ratio() {
      if (!this.reserveFrom || !this.reserveTo || !this.from || !this.to) {
        return null;
      }
      return reduceDecimals(this.reserveFrom, this.from)
        .div(reduceDecimals(this.reserveTo, this.to)).toNumber();
    },
    enoughFromBalance() {
      // TODO: delete this
      return true;
      /* return this.balanceFrom && this.balanceFrom.isGreaterThanOrEqualTo(this.amountFrom); */
    },
    enoughToBalance() {
      // TODO: delete this
      return true;
      /* return this.balanceTo && this.balanceTo.isGreaterThanOrEqualTo(this.amountTo); */
    },
    isDisabled() {
      return this.address
        && (!this.to || !this.from || !this.amountFrom
        || !this.enoughToBalance || !this.enoughFromBalance);
    },
    hasAllowanceFrom() {
      return this.amountFrom != null && this.allowanceFrom === this.amountFrom;
    },
    hasAllowanceTo() {
      return this.amountFrom != null && this.allowanceFrom === this.amountFrom;
    },
    isApproved() {
      if (this.from && this.from.contract_id === WAE) {
        return this.hasAllowanceTo;
      } if (this.to && this.to.contract_id === WAE) {
        return this.hasAllowanceFrom;
      }
      return this.hasAllowanceFrom && this.hasAllowanceTo;
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (!this.amountFrom || !this.amountTo) return 'Enter amount';
      if (!this.enoughFromBalance) return `Insufficient ${this.from.symbol} balance`;
      if (!this.enoughToBalance) return `Insufficient ${this.to.symbol} balance`;
      return 'Supply';
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.to && this.from) {
        await this.setPairInfo();
        if (this.amountFrom !== null || this.amountTo !== null) {
          this.setAmount(
            this.isLastAmountFrom ? this.amountFrom : this.amountTo, this.isLastAmountFrom,
          );
        }
      }
    },
  },
  methods: {
    async setSelectedToken(token, isFrom) {
      const [oldFrom, oldTo] = [this.from, this.to];
      let swapped;
      [this.from, this.to, swapped] = calculateSelectedToken(token, this.from, this.to, isFrom);
      if (swapped) {
        const swap = this.amountFrom;
        this.amountFrom = this.amountTo;
        this.amountTo = swap;
        const swapAllowance = this.allowanceFrom;
        this.allowanceFrom = this.allowanceTo;
        this.allowanceTo = swapAllowance;
        this.isLastAmountFrom = !this.isLastAmountFrom;
        const swapReserve = this.reserveFrom;
        this.reserveFrom = this.reserveTo;
        this.reserveTo = swapReserve;
      } else if (isFrom && oldFrom && this.from && oldFrom.contract_id !== this.from.contract_id) {
        this.allowanceFrom = null;
      } else if (oldTo && this.to && oldTo.contract_id !== this.to.contract_id) {
        this.allowanceTo = null;
      }

      // TODO: what if it fails?
      await this.setPairInfo();
      this.setAmount(
        this.isLastAmountFrom ? this.amountFrom : this.amountTo, this.isLastAmountFrom,
      );
    },
    getAePair() {
      if (this.from && this.to) {
        if (this.from.contract_id === WAE) {
          return {
            isTokenFrom: false,
            token: this.to,
            tokenAmount: this.amountTo,
            wae: this.from,
            aeAmount: this.amountFrom,
          };
        } if (this.to.contract_id === WAE) {
          return {
            isTokenFrom: true,
            token: this.from,
            tokenAmount: this.amountFrom,
            wae: this.to,
            aeAmount: this.amountTo,
          };
        }
      }
      return null;
    },
    async setPairInfo() {
      try {
        if (!this.from || !this.to || !this.address) {
          return;
        }
        const {
          totalSupply,
          reserveA,
          reserveB,
        } = await this.$store.dispatch('aeternity/getPoolInfo', {
          tokenA: this.from.contract_id,
          tokenB: this.to.contract_id,
        });
        this.totalSupply = totalSupply;
        this.reserveFrom = reserveA;
        this.reserveTo = reserveB;
      } catch (e) {
        if (e.message !== 'PAIR NOT FOUND') {
          handleUnknownError(e);
        }
      }
    },
    setAmount(amount, isFrom) {
      this.isLastAmountFrom = isFrom;
      const isValid = this.ratio !== null && this.to && this.from;
      if (isFrom) {
        this.amountFrom = amount;
        if (isValid) {
          this.amountTo = amount / this.ratio;
        }
      } else {
        this.amountTo = amount;
        if (isValid) {
          this.amountFrom = amount * this.ratio;
        }
      }
    },
    async createAllowance(token, amount) {
      try {
        /* await this.$store.dispatch('aeternity/resetAllowance', { */
        /* token: token.contract_id, */
        /* }); */
        await this.$store.dispatch('aeternity/createTokenAllowance', {
          token: token.contract_id,
          amount: BigInt(BigNumber(10).pow(token.decimals).times(amount)),
        });
      } catch (ex) {
        // TODO: this is a hack
        console.error(ex);
      }
    },
    async approve() {
      try {
        const aePair = this.getAePair();
        if (!aePair) {
          await this.createAllowance(this.from, this.amountFrom);
          this.allowanceFrom = this.amountFrom;
          await this.createAllowance(this.to, this.amountTo);
          this.allowanceTo = this.amountTo;
        } else {
          await this.createAllowance(aePair.token, aePair.tokenAmount);
          if (aePair.isTokenFrom) {
            this.allowanceFrom = aePair.tokenAmount;
          } else {
            this.allowanceTo = aePair.tokenAmount;
          }
        }
      } catch (ex) {
        handleUnknownError(ex);
      }
    },
    clickHandler() {
      if (this.address) {
        this.supply();
      } else {
        this.connectWallet();
      }
    },
    async connectWallet() {
      this.loading = true;
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('scanForWallets');
      this.loading = false;
    },
    async supply() {
      try {
        await this.$store.dispatch('modals/open', {
          name: 'confirm-add',
          firstToken: this.from,
          secondToken: this.to,
          firstAmount: this.amountFrom,
          secondAmount: this.amountTo,
          ratio: this.ratio,
          receive: BigNumber(this.liquidity).div(BigNumber(10).pow(18)),
          share: this.share,
        });
        const addDecimals = (token, amount) => BigInt(BigNumber(10)
          .pow(token.decimals).times(amount));

        const aePair = this.getAePair();
        // if none of the selected tokens are WAE
        if (!aePair) {
          await this.$store.dispatch('aeternity/addLiquidity', {
            tokenA: this.from.contract_id,
            tokenB: this.to.contract_id,
            amountADesired: addDecimals(this.from, this.amountFrom),
            amountBDesired: addDecimals(this.to, this.amountTo),
            minimumLiquidity,
          });
        } else {
          await this.$store.dispatch('aeternity/addLiquidityAe', {
            token: aePair.token.contract_id,
            amountTokenDesired: addDecimals(aePair.token, aePair.tokenAmount),
            amountAeDesired: addDecimals(aePair.wae, aePair.aeAmount),
            minimumLiquidity,
          });
        }
        this.allowanceTo = null;
        this.allowanceFrom = null;
        alert('IT IS DONE');
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        handleUnknownError(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.add-liquidity {
  .input-token {
    margin: 20px 0;
  }

  .button-default {
    width: 100%;
    padding: 16px;
    margin-top: 8px;

    @extend %face-sans-20-medium;

    &.loading {
      padding: 0;
    }

    &.allowance-button {
      font-size: 16px;
      justify-content: space-between;
      margin-bottom: 12px;

      &, div {
        display: flex;
        align-items: center;
      }

      .allowance {
        max-width: 350px;

        img {
          margin-right: 8px;
        }
      }

      img {
        width: 20px;
        height: 20px;
      }
    }

    :deep(.spinner) {
      height: 50px;
      width: 50px;
    }
  }

  .pool-info {
    color: white;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    font-weight: 500;

    .header {
      text-align: left;
    }

    .header, .body {
      padding: 16px;
    }

    &, > .body {
      border: 1px solid variables.$color-black;
      background-color: variables.$color-black2;
      border-radius: 20px;
    }

    .body {
      display: flex;
      justify-content: space-evenly;

      div {
        display: flex;
        flex-direction: column;

        .second {
          padding-top: 4px;
          color: variables.$color-white2;
        }
      }
    }
  }
}
</style>
