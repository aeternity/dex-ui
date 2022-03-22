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
      :ae-vs-wae="tokenA?.contract_id === WAE || tokenB?.contract_id === WAE"
      :chosen-tokens="(tokenB || tokenA) && [tokenA, tokenB]"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balanceTokenA = $event"
    />
    <PlusIcon />
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      :ae-vs-wae="tokenA?.contract_id === WAE || tokenB?.contract_id === WAE"
      :chosen-tokens="(tokenB || tokenA) && [tokenB, tokenA]"
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
      :disabled="address && (isDisabled || inProgress || !enoughAllowance || fetchingPairInfo)"
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
import { reduceDecimals, expandDecimals, getAePair } from '../lib/utils';
import saveTokenSelectionMixin from '../mixins/saveTokenSelectionMixin';
import setTokenPairInfoMixin from '../mixins/setTokenPairInfoMixin';
import { MAGNITUDE, MINIMUM_LIQUIDITY } from '../lib/constants';
import PlusIcon from '../assets/plus.svg?vue-component';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';
import approvalMixin from '../mixins/allowanceMixin';

export default {
  components: {
    Tip,
    MainWrapper,
    InputToken,
    ButtonDefault,
    PlusIcon,
    AnimatedSpinner,
  },
  mixins: [saveTokenSelectionMixin, approvalMixin, setTokenPairInfoMixin],
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
    WAE: process.env.VUE_APP_WAE_ADDRESS,
  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState('aeternity', ['slippage', 'fetchingPairInfo']),
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
      return this.balanceTokenA?.isGreaterThanOrEqualTo(this.amountTokenA);
    },
    enoughBalanceTokenB() {
      return this.balanceTokenB?.isGreaterThanOrEqualTo(this.amountTokenB);
    },
    isDisabled() {
      return !this.tokenB || !this.tokenA || +this.amountTokenA <= 0
        || !this.enoughBalanceTokenB || !this.enoughBalanceTokenA;
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
    async address(newVal) {
      if (newVal) {
        await this.refreshAllowances();
      }
    },
  },
  methods: {
    async approve() {
      try {
        this.approving = true;
        const aePair = getAePair(
          this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB,
        );
        if (!aePair) {
          await this.createAndRefreshAllowance(this.tokenA, this.amountTokenA);
          await this.createAndRefreshAllowance(this.tokenB, this.amountTokenB);
        } else {
          await this.createAndRefreshAllowance(aePair.token, aePair.tokenAmount);
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
    async refreshAllowances() {
      if (this.tokenA && !this.tokenA.is_ae) {
        await this.refreshAllowance(this.tokenA?.contract_id, this.fetchAllowance);
      }
      if (this.tokenB && !this.tokenB.is_ae) {
        await this.refreshAllowance(this.tokenB?.contract_id, this.fetchAllowance);
      }
    },
    async reset() {
      await this.setPairInfo();
      this.amountTokenA = null;
      this.amountTokenB = null;
      await this.refreshAllowances();
      this.isLastInputTokenA = true;
      this.$store.commit('navigation/setPool', null);
    },
    async supplyProcess() {
      let result;
      const aePair = getAePair(
        this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB,
      );
      this.supplying = true;
      // if none of the selected tokens are WAE
      if (!aePair) {
        result = await this.$store.dispatch('aeternity/addLiquidity', {
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
        result = await this.$store.dispatch('aeternity/addLiquidityAe', {
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
      return result;
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
