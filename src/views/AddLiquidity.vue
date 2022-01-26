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
      :include-wae="false"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balanceTokenA = $event"
    />
    <img src="../assets/plus.svg">
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      :include-wae="false"
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
            <!-- TODO: toFixed(8) is a temporary hack to make big values to fit into UI -->
            {{ ratio?.toFixed(8) ?? '-' }}
          </span>
          <span class="second">
            {{ `${ tokenA.symbol } per ${ tokenB.symbol }` }}
          </span>
        </div>
        <div>
          <span>
            <!-- TODO: toFixed(8) is a temporary hack to make big values to fit into UI -->
            {{ ratio ? (1 / ratio).toFixed(8) : '-' }}
          </span>
          <span class="second">
            {{ `${ tokenB.symbol } per ${ tokenA.symbol }` }}
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
      :disabled="isApproved || inProgress"
      @click="approve"
    >
      {{ approveButtonMessage }}
    </ButtonDefault>
    <ButtonDefault
      :fill="address ? 'blue' : 'transparent-blue'"
      :disabled="isDisabled || inProgress"
      :spinner="connectingToWallet"
      :class="{ loading: connectingToWallet }"
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
import {
  reduceDecimals, expandDecimals, calculateSelectedToken, handleUnknownError, getAePair,
} from '../lib/utils';

const WAE = process.env.VUE_APP_WAE_ADDRESS;

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
    approving: false,
    supplying: false,

  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState({
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    inProgress() {
      return this.approving || this.supplying || this.connectingToWallet;
    },
    liquidity() {
      if (!this.tokenA
        || !this.tokenB
        || !this.amountTokenA
        || !this.amountTokenB
      ) {
        return 0;
      }
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA.decimals);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB.decimals);

      // if there is no pair yet we have a special
      // case for the first provided liquidity
      if (!this.reserveTokenA || !this.reserveTokenB || !this.totalSupply) {
        return BigNumber(amountTokenA)
          .times(amountTokenB)
          .sqrt()
          .minus(minimumLiquidity);
      }
      const liquidityTokenA = (amountTokenA * this.totalSupply) / this.reserveTokenA;
      const liquidityTokenB = (amountTokenB * this.totalSupply) / this.reserveTokenB;
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
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA.decimals);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB.decimals);
      const amount = amountTokenA * amountTokenB;
      const reserve = this.reserveTokenB * this.reserveTokenA;
      return BigNumber(amount).times(100).div(reserve).toNumber();
    },
    ratio() {
      if (!this.reserveTokenA || !this.reserveTokenB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveTokenA, this.tokenA.decimals)
        .div(reduceDecimals(this.reserveTokenB, this.tokenB.decimals)).toNumber();
    },
    enoughBalanceTokenA() {
      return (this.tokenA && this.tokenA.contract_id === WAE)
        || (this.balanceTokenA && this.balanceTokenA.isGreaterThanOrEqualTo(this.amountTokenA));
    },
    enoughBalanceTokenB() {
      return (this.tokenB && this.tokenB.contract_id === WAE)
       || (this.balanceTokenB && this.balanceTokenB.isGreaterThanOrEqualTo(this.amountTokenB));
    },
    isDisabled() {
      return this.address && (!this.tokenB || !this.tokenA || !this.amountTokenA
          || !this.enoughBalanceTokenB || !this.enoughBalanceTokenA);
    },
    hasAllowanceTokenA() {
      return this.amountTokenA != null && this.allowanceTokenA === this.amountTokenA;
    },
    hasAllowanceTokenB() {
      return this.amountTokenB != null && this.allowanceTokenB === this.amountTokenB;
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
    approveButtonMessage() {
      if (this.isApproved) return 'Approved';
      if (this.approving) return 'Approving...';
      return 'Approve';
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (this.supplying) return 'Supplying...';
      if (!this.amountTokenA || !this.amountTokenB || !this.tokenA || !this.tokenB) return 'Enter amount';
      if (!this.enoughBalanceTokenA) return `Insufficient ${this.tokenA.symbol} balance`;
      if (!this.enoughBalanceTokenB) return `Insufficient ${this.tokenB.symbol} balance`;
      return 'Supply';
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        [this.totalSupply, this.reserveTokenA, this.reserveTokenB] = await this.$store.dispatch('aeternity/getPairInfo',
          { tokenA: this.tokenA, tokenB: this.tokenB });
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
      if (!swapped) {
        [this.totalSupply, this.reserveTokenA, this.reserveTokenB] = await this.$store.dispatch('aeternity/getPairInfo',
          { tokenA: this.tokenA, tokenB: this.tokenB });
      }
      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
      );
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
      await this.$store.dispatch('aeternity/createTokenAllowance', {
        token: token.contract_id,
        amount: expandDecimals(amount, token.decimals),
      });
    },
    async approve() {
      try {
        this.approving = true;
        const aePair = getAePair(
          this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB, false,
        );
        if (!aePair) {
          await this.createAllowance(this.tokenA, this.amountTokenA);
          this.allowanceTokenA = this.amountTokenA;
          await this.createAllowance(this.tokenB, this.amountTokenB);
          this.allowanceTokenB = this.amountTokenB;
        } else {
          await this.createAllowance(aePair.token, aePair.tokenAmount);
          if (aePair.isTokenFrom) {
            this.allowanceTokenA = aePair.tokenAmount;
          } else {
            this.allowanceTokenB = aePair.tokenAmount;
          }
        }
      } catch (e) {
        handleUnknownError(e);
      } finally {
        this.approving = false;
      }
    },
    async clickHandler() {
      if (this.address) {
        this.supply();
      } else {
        await this.$watchUntilTruly(() => this.$store.state.sdk);
        await this.$store.dispatch('connectWallet');
      }
    },
    async reset() {
      [this.totalSupply, this.reserveTokenA, this.reserveTokenB] = await this.$store.dispatch('aeternity/getPairInfo',
        { tokenA: this.tokenA, tokenB: this.tokenB });
      this.amountTokenA = null;
      this.amountTokenB = null;
      this.allowanceTokenA = null;
      this.allowanceTokenB = null;
      this.isLastInputTokenA = true;
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
          receive: reduceDecimals(this.liquidity, 18),
          share: this.share,
        });

        const aePair = getAePair(
          this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB, false,
        );
        this.supplying = true;
        // if none of the selected tokens are WAE
        if (!aePair) {
          await this.$store.dispatch('aeternity/addLiquidity', {
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            amountADesired: expandDecimals(this.amountTokenA, this.tokenA.decimals),
            amountBDesired: expandDecimals(this.amountTokenB, this.tokenB.decimals),
            minimumLiquidity,
          });
          // to refresh liquidity list
          await this.$store.dispatch('aeternity/pullAccountLiquidity', {
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            tokenASymbol: this.tokenA.symbol,
            tokenBSymbol: this.tokenB.symbol,
            tokenADecimals: this.tokenA.decimals,
            tokenBDecimals: this.tokenB.decimals,
          });
        } else {
          await this.$store.dispatch('aeternity/addLiquidityAe', {
            token: aePair.token.contract_id,
            amountTokenDesired: expandDecimals(aePair.tokenAmount, aePair.token.decimals),
            amountAeDesired: expandDecimals(aePair.aeAmount, aePair.wae.decimals),
            minimumLiquidity,
          });

          // to refresh liquidity list
          await this.$store.dispatch('aeternity/pullAccountLiquidity', {
            tokenA: aePair.token.contract_id,
            tokenASymbol: aePair.token.symbol,
            tokenADecimals: aePair.token.decimals,
            tokenB: aePair.wae.contract_id,
            tokenBSymbol: aePair.wae.symbol,
            tokenBDecimals: aePair.wae.decimals,
          });
        }
        await this.reset();
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        handleUnknownError(e);
      } finally {
        this.supplying = false;
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
