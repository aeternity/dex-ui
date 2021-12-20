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
            0.00299402
          </span>
          <span class="second">
            {{ `${to.symbol} per ${from.symbol}` }}
          </span>
        </div>
        <div>
          <span>
            {{ 1 / 0.00299402 }}
          </span>
          <span class="second">
            {{ `${from.symbol} per ${to.symbol}` }}
          </span>
        </div>
        <div>
          <span>
            0%
          </span>
          <span class="second">
            Share of Pool
          </span>
        </div>
      </div>
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      :disabled="hasAllowanceFrom && hasAllowanceTo"
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
    ratio: null,
    totalSupply: null,
    balanceFrom: null,
    balanceTo: null,
    allowanceFrom: 0,
    allowanceTo: null,

  }),
  computed: {
    ...mapState(['address']),
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
        const reduceDecimals = (val, token) => BigNumber(val)
          .div(BigNumber(10).pow(token.decimals));
        this.ratio = reduceDecimals(reserveA, this.from)
          .div(reduceDecimals(reserveB, this.to)).toNumber();
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
        await this.createAllowance(this.from, this.amountFrom);
        this.allowanceFrom = this.amountFrom;
        await this.createAllowance(this.to, this.amountTo);
        this.allowanceTo = this.amountTo;
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
          receive: +this.amountFrom + +this.amountTo, // Should be calculated
        });
        const addDecimals = (token, amount) => BigInt(BigNumber(10)
          .pow(token.decimals).times(amount));

        await this.$store.dispatch('aeternity/addLiquidity', {
          tokenA: this.from.contract_id,
          tokenB: this.to.contract_id,
          amountADesired: addDecimals(this.from, this.amountFrom),
          amountBDesired: addDecimals(this.to, this.amountTo),
          // TODO: this is what uniswap uses as minimumLiquidity, let's decide on it
          minimumLiquidity: 1000n,
        });
        console.log('IT IS DONE');
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
