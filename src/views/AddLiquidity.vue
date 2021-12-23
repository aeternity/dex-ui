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
      :value="amountTokenA"
      :token="tokenA"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balanceTokenA = $event"
    />
    <img src="../assets/plus.svg">
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
      @update:balance="balanceTokenB = $event"
    />

    <div
      v-if="tokenB && tokenA"
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
            {{ `${ tokenB.symbol } per ${ tokenA.symbol }` }}
          </span>
        </div>
        <div>
          <span>
            {{ ratio ? 1 / ratio : '-' }}
          </span>
          <span class="second">
            {{ `${ tokenA.symbol } per ${ tokenB.symbol }` }}
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
    tokenB: null,
    tokenA: null,
    amountTokenA: '',
    amountTokenB: '',
    isLastInputTokenA: true,
    totalSupply: null,
    balanceTokenA: null,
    balanceTokenB: null,
    allowanceTokenA: null,
    allowanceTokenB: null,
    reserveTokenA: null,
    reserveTokenB: null,

  }),
  computed: {
    ...mapState({
      address: 'address',
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    liquidity() {
      if (!this.tokenA
        || !this.tokenB
        || !this.amountTokenA
        || !this.amountTokenB
      ) {
        return 0;
      }
      const { totalSupply } = this;
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB);

      // if there is no pair yet we have a special
      // case for the first provided liquidity
      if (!this.reserveTokenA || !this.reserveTokenB || !totalSupply) {
        return BigNumber(amountTokenA)
          .times(amountTokenB)
          .sqrt()
          .minus(minimumLiquidity);
      }
      const liquidityTokenA = (amountTokenA * totalSupply) / this.reserveTokenA;
      const liquidityTokenB = (amountTokenB * totalSupply) / this.reserveTokenB;
      return liquidityTokenA < liquidityTokenB ? liquidityTokenA : liquidityTokenB;
    },
    share() {
      if (!this.totalSupply && this.amountTokenA && this.amountTokenB) {
        return 100;
      }
      if (!this.reserveTokenA
        || !this.reserveTokenB
        || !this.tokenA
        || !this.tokenB
        || !this.amountTokenA
        || !this.amountTokenB
      ) {
        return null;
      }
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB);
      const amount = amountTokenA * amountTokenB;
      const reserve = this.reserveTokenB * this.reserveTokenA;
      return BigNumber(amount).times(100).div(reserve).toNumber();
    },
    ratio() {
      if (!this.reserveTokenA || !this.reserveTokenB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveTokenA, this.tokenA)
        .div(reduceDecimals(this.reserveTokenB, this.tokenB)).toNumber();
    },
    enoughBalanceTokenA() {
      return this.balanceTokenA && this.balanceTokenA.isGreaterThanOrEqualTo(this.amountTokenA);
    },
    enoughBalanceTokenB() {
      return this.balanceTokenB && this.balanceTokenB.isGreaterThanOrEqualTo(this.amountTokenB);
    },
    isDisabled() {
      return this.address
        && (!this.tokenB || !this.tokenA || !this.amountTokenA
          || !this.enoughBalanceTokenB || !this.enoughBalanceTokenA);
    },
    hasAllowanceTokenA() {
      return this.amountTokenA != null && this.allowanceTokenA === this.amountTokenA;
    },
    hasAllowanceTokenB() {
      return this.amountTokenA != null && this.allowanceTokenA === this.amountTokenA;
    },
    isApproved() {
      if (this.tokenA && this.tokenA.contract_id === WAE) {
        return this.hasAllowanceTokenB;
      }
      if (this.tokenB && this.tokenB.contract_id === WAE) {
        return this.hasAllowanceTokenA;
      }
      return this.hasAllowanceTokenA && this.hasAllowanceTokenB;
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (!this.amountTokenA || !this.amountTokenB) return 'Enter amount';
      if (!this.enoughBalanceTokenA) return `Insufficient ${this.tokenA.symbol} balance`;
      if (!this.enoughBalanceTokenB) return `Insufficient ${this.tokenB.symbol} balance`;
      return 'Supply';
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        await this.setPairInfo();
        if (this.amountTokenA !== null || this.amountTokenB !== null) {
          this.setAmount(
            this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
          );
        }
      }
    },
  },
  methods: {
    async setSelectedToken(token, isTokenA) {
      const [oldTokenA, oldTokenB] = [this.tokenA, this.tokenB];
      let swapped;
      [this.tokenA, this.tokenB, swapped] = calculateSelectedToken(
        token,
        this.tokenA,
        this.tokenB,
        isTokenA,
      );
      if (swapped) {
        const swap = this.amountTokenA;
        this.amountTokenA = this.amountTokenB;
        this.amountTokenB = swap;
        const swapAllowance = this.allowanceTokenA;
        this.allowanceTokenA = this.allowanceTokenB;
        this.allowanceTokenB = swapAllowance;
        this.isLastInputTokenA = !this.isLastInputTokenA;
        const swapReserve = this.reserveTokenA;
        this.reserveTokenA = this.reserveTokenB;
        this.reserveTokenB = swapReserve;
      } else if (
        isTokenA
        && oldTokenA
        && this.tokenA
        && oldTokenA.contract_id !== this.tokenA.contract_id
      ) {
        this.allowanceTokenA = null;
      } else if (oldTokenB && this.tokenB && oldTokenB.contract_id !== this.tokenB.contract_id) {
        this.allowanceTokenB = null;
      }

      // TODO: what if it fails?
      await this.setPairInfo();
      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
      );
    },
    getAePair() {
      if (this.tokenA && this.tokenB) {
        if (this.tokenA.contract_id === WAE) {
          return {
            isTokenA: false,
            token: this.tokenB,
            tokenAmount: this.amountTokenB,
            wae: this.tokenA,
            aeAmount: this.amountTokenA,
          };
        }
        if (this.tokenB.contract_id === WAE) {
          return {
            isTokenA: true,
            token: this.tokenA,
            tokenAmount: this.amountTokenA,
            wae: this.tokenB,
            aeAmount: this.amountTokenB,
          };
        }
      }
      return null;
    },
    async setPairInfo() {
      try {
        if (!this.tokenA || !this.tokenB || !this.address) {
          return;
        }
        const {
          totalSupply,
          reserveA,
          reserveB,
        } = await this.$store.dispatch('aeternity/getPoolInfo', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
        });
        this.totalSupply = totalSupply;
        this.reserveTokenA = reserveA;
        this.reserveTokenB = reserveB;
      } catch (e) {
        if (e.message !== 'PAIR NOT FOUND') {
          handleUnknownError(e);
        }
      }
    },
    setAmount(amount, isLastInputTokenA) {
      this.isLastInputTokenA = isLastInputTokenA;
      const isValid = this.ratio !== null && this.tokenB && this.tokenA;
      if (isLastInputTokenA) {
        this.amountTokenA = amount;
        if (isValid) {
          this.amountTokenB = amount / this.ratio;
        }
      } else {
        this.amountTokenB = amount;
        if (isValid) {
          this.amountTokenA = amount * this.ratio;
        }
      }
    },
    async createAllowance(token, amount) {
      try {
        await this.$store.dispatch('aeternity/createTokenAllowance', {
          token: token.contract_id,
          amount: BigInt(BigNumber(10).pow(token.decimals).times(amount)),
        });
      } catch (ex) {
        // TODO: this is a hack
        handleUnknownError(ex);
      }
    },
    async approve() {
      try {
        const aePair = this.getAePair();
        if (!aePair) {
          await this.createAllowance(this.tokenA, this.amountTokenA);
          this.allowanceTokenA = this.amountTokenA;
          await this.createAllowance(this.tokenB, this.amountTokenB);
          this.allowanceTokenB = this.amountTokenB;
        } else {
          await this.createAllowance(aePair.token, aePair.tokenAmount);
          if (aePair.isTokenA) {
            this.allowanceTokenA = aePair.tokenAmount;
          } else {
            this.allowanceTokenB = aePair.tokenAmount;
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
          firstToken: this.tokenA,
          secondToken: this.tokenB,
          firstAmount: this.amountTokenA,
          secondAmount: this.amountTokenB,
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
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            amountADesired: addDecimals(this.tokenA, this.amountTokenA),
            amountBDesired: addDecimals(this.tokenB, this.amountTokenB),
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
        this.allowanceTokenB = null;
        this.allowanceTokenA = null;
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
