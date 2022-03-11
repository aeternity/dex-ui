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
    <PlusIcon />
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
      <div
        v-if="fetchingPairInfo"
        class="body fetching-pair-info"
      >
        <AnimatedSpinner />
        <span>Fetching best price...</span>
      </div>
      <div
        v-else
        class="body"
      >
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
      :disabled="enoughAllowance || inProgress || fetchingAllowance || fetchingPairInfo"
      @click="approve"
    >
      {{ approveButtonMessage }}
    </ButtonDefault>
    <ButtonDefault
      :fill="address ? 'blue' : 'transparent-blue'"
      :disabled="isDisabled || inProgress || !enoughAllowance || fetchingPairInfo "
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
  reduceDecimals, expandDecimals, calculateSelectedToken, getAePair,
  handleUnknownError,
} from '../lib/utils';
import saveTokenSelection from '../mixins/saveTokenSelection';

import { MAGNITUDE, MINIMUM_LIQUIDITY } from '../lib/constants';
import PlusIcon from '../assets/plus.svg?vue-component';
import AnimatedSpinner from '../assets/animated-spinner.svg?vue-component';
import approvalMixin from '../lib/allowance-mixin';

const WAE = process.env.VUE_APP_WAE_ADDRESS;

export default {
  components: {
    Tip,
    MainWrapper,
    InputToken,
    ButtonDefault,
    PlusIcon,
    AnimatedSpinner,
  },
  mixins: [saveTokenSelection, approvalMixin],
  data: () => ({
    tokenB: null,
    tokenA: null,
    amountTokenA: '',
    amountTokenB: '',
    isLastInputTokenA: true,
    totalSupply: null,
    balanceTokenA: null,
    balanceTokenB: null,
    reserveTokenA: null,
    reserveTokenB: null,
    approving: false,
    supplying: false,

  }),
  computed: {
    ...mapState(['connectingToWallet']),
    ...mapState('aeternity', ['slippage']),
    ...mapState({
      factory: (state) => state.aeternity.factory?.deployInfo.address,
      fetchingPairInfo: (state) => state.aeternity.fetchingPairInfo,
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
          .minus(MINIMUM_LIQUIDITY);
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
      return this.address && (!this.tokenB || !this.tokenA || +this.amountTokenA <= 0
          || !this.enoughBalanceTokenB || !this.enoughBalanceTokenA);
    },
    approveButtonMessage() {
      if (this.approving) return 'Approving...';
      if (this.fetchingAllowance) return 'Verifying approval...';
      if (this.enoughAllowance) return 'Approved';
      return 'Approve';
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (this.supplying) return 'Supplying...';
      if (+this.amountTokenA <= 0 || !this.amountTokenB || !this.tokenA || !this.tokenB) return 'Enter amount';
      if (!this.enoughBalanceTokenA) return `Insufficient ${this.tokenA.symbol} balance`;
      if (!this.enoughBalanceTokenB) return `Insufficient ${this.tokenB.symbol} balance`;
      return 'Supply';
    },
    enoughAllowance() {
      if (!this.tokenA || !this.tokenB) return false;
      const enough = (token, amount) => token.is_ae || this.enoughTokenAllowance(
        token.contract_id, amount, token.decimals,
      );

      return enough(this.tokenA, this.amountTokenA) && enough(this.tokenB, this.amountTokenB);
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.tokenB && this.tokenA) {
        await this.setPairInfo();
        if (this.amountTokenA || this.amountTokenB) {
          this.setAmount(
            this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
          );
        }
      }
    },
  },
  methods: {
    fetchAlowance(tokenId) {
      return this.$store.dispatch('aeternity/getRouterTokenAllowance', {
        token: tokenId,
      });
    },
    async setSelectedToken(token, isTokenA) {
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
        this.isLastInputTokenA = !this.isLastInputTokenA;
        const swapReserve = this.reserveTokenA;
        this.reserveTokenA = this.reserveTokenB;
        this.reserveTokenB = swapReserve;
      }
      if (!swapped) {
        const tokenA = isTokenA ? this.tokenA : this.tokenB;
        if (tokenA && !tokenA.is_ae) {
          await this.fetchAllowanceIfNone(tokenA.contract_id, this.fetchAlowance);
        }
      }

      this.saveTokenSelection(this.tokenA, this.tokenB);

      // TODO: what if it fails?
      if (!swapped) {
        await this.setPairInfo();
      }
      this.setAmount(
        this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB, this.isLastInputTokenA,
      );
    },
    async setPairInfo() {
      try {
        [
          this.totalSupply,
          this.reserveTokenA,
          this.reserveTokenB,
        ] = await this.$store.dispatch('aeternity/getPairInfo', {
          tokenA: this.tokenA,
          tokenB: this.tokenB,
        });
      } catch (e) {
        handleUnknownError(e);
      }
    },
    setAmount(amount, isLastInputTokenA) {
      this.isLastInputTokenA = isLastInputTokenA;
      if (isLastInputTokenA) {
        this.amountTokenA = amount;
        if (this.ratio) {
          this.amountTokenB = amount ? amount / this.ratio : '';
        }
      } else {
        this.amountTokenB = amount;
        if (this.ratio) {
          this.amountTokenA = amount ? amount * this.ratio : '';
        }
      }
      this.saveAmountSelection(amount, isLastInputTokenA);
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
          this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB,
        );
        const safeRefresh = (token, amount) => {
          if (!token || token.is_ae) return null;
          return this.safeRefreshAllowance(
            token.contract_id, amount, token.decimals, this.fetchAlowance,
          );
        };
        if (!aePair) {
          await this.createAllowance(this.tokenA, this.amountTokenA);
          await safeRefresh(this.tokenA, this.amountTokenA);
          await this.createAllowance(this.tokenB, this.amountTokenB);
          await safeRefresh(this.tokenB, this.amountTokenB);
        } else {
          await this.createAllowance(aePair.token, aePair.tokenAmount);
          await safeRefresh(
            aePair.isTokenFrom ? this.tokenA : this.tokenB,
            aePair.tokenAmount,
          );
        }
      } catch (e) {
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.approving = false;
      }
    },
    async clickHandler() {
      if (this.address) {
        this.supply();
      } else {
        this.$store.dispatch('modals/open', { name: 'connect-wallet' });
      }
    },
    async reset() {
      await this.setPairInfo();
      this.amountTokenA = null;
      this.amountTokenB = null;
      if (!this.tokenA?.is_ae) {
        await this.refreshAllowance(this.tokenA?.contract_id, this.fetchAlowance);
      }
      if (!this.tokenB?.is_ae) {
        await this.refreshAllowance(this.tokenB?.contract_id, this.fetchAlowance);
      }
      this.isLastInputTokenA = true;
      this.$store.commit('navigation/setPool', null);
    },
    async supplyProcess() {
      const aePair = getAePair(
        this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB,
      );
      this.supplying = true;
      // if none of the selected tokens are WAE
      if (!aePair) {
        await this.$store.dispatch('aeternity/addLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          amountADesired: expandDecimals(this.amountTokenA, this.tokenA.decimals),
          amountBDesired: expandDecimals(this.amountTokenB, this.tokenB.decimals),
          minimumLiquidity: MINIMUM_LIQUIDITY,
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
          minimumLiquidity: MINIMUM_LIQUIDITY,
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
    },
    async supply() {
      try {
        await this.$store.dispatch('modals/open', {
          name: 'confirm-liquidity',
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          amountA: BigNumber(this.amountTokenA),
          amountB: BigNumber(this.amountTokenB),
          ratio: this.ratio,
          pairAmount: reduceDecimals(this.liquidity, MAGNITUDE),
          share: this.share,
          isAdding: true,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: `Providing liquidity of ${this.amountTokenA} ${this.tokenA.symbol} and ${this.amountTokenB} ${this.tokenB.symbol}`,
          work: this.supplyProcess,
        });
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
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

      &,
      div {
        display: flex;
        align-items: center;
      }

      .allowance {
        max-width: 350px;

        svg {
          margin-right: 8px;
        }
      }

      svg {
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

    .header,
    .body {
      padding: 16px;
    }

    &,
    > .body {
      border: 1px solid variables.$color-black;
      background-color: variables.$color-black2;
      border-radius: 20px;
    }

    .body {
      display: flex;
      justify-content: space-evenly;
      align-items: center;

      &.fetching-pair-info {
        svg {
          width: 32px;
        }
      }

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
