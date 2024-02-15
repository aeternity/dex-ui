<template>
  <MainWrapper
    :title="$t('nav.swap')"
    settings
    class="swap-view"
  >
    <Head>
      <title>Swap - Superhero DEX</title>
    </Head>
    <InputToken
      :value="amountTokenA"
      :token="tokenA"
      :chosen-tokens="[tokenA, tokenB]"
      :loading="restoringTokenSelection"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balance = $event"
    />
    <ButtonPlain
      class="swap-button"
      @click="switchSelectedTokens(null)"
    >
      <DownArrow />
    </ButtonPlain>
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      :chosen-tokens="[tokenB, tokenA]"
      :loading="restoringTokenSelection"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
    />
    <div
      v-if="fetchingPairInfo"
      class="fetching-pair-info"
    >
      <AnimatedSpinner />
      <span>{{ $t('fetchPrice') }}...</span>
    </div>
    <div
      v-else-if="tokenB && tokenA && ratio"
      class="price"
    >
      {{ `1 ${tokenB.symbol} = ${1 / ratio} ${tokenA.symbol}` }}
    </div>
    <ButtonDefault
      v-if="!isDisabled && address && !enoughAllowance"
      class="allowance-button"
      :disabled="approving || !tokenA || !amountTokenA || fetchingPairInfo || fetchingAllowance
        || enoughAllowance"
      @click="approve"
    >
      <div class="allowance">
        <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`" alt="">
        {{ approveBtnMessage }}
      </div>
      <ButtonTooltip :tooltip="$t('swap.permissionToolTip', { msg: tokenA.symbol })">
        <QuestionCircle />
      </ButtonTooltip>
    </ButtonDefault>

    <ButtonDefault
      :disabled="address && (swapping || connectingToWallet || isDisabled || approving
        || fetchingPairInfo || !enoughAllowance)"
      :spinner="connectingToWallet"
      :class="{ loading: connectingToWallet }"
      @click="clickHandler"
    >
      {{ buttonMessage }}
    </ButtonDefault>
  </MainWrapper>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Head } from '@vueuse/head';
import MainWrapper from '@/components/MainWrapper.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonPlain from '@/components/ButtonPlain.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import ButtonTooltip from '@/components/ButtonTooltip.vue';
import { expandDecimals, getAePair } from '@/lib/utils';
import { getPath } from '@/lib/swapUtils';
import DownArrow from '@/assets/arrow-down.svg';
import QuestionCircle from '@/assets/question-circle.svg';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import saveTokenSelectionMixin from '@/mixins/saveTokenSelectionMixin';
import approvalMixin from '@/mixins/allowanceMixin';
import setSwapRoutesMixin from '@/mixins/setSwapRoutesMixin';

export default {
  components: {
    MainWrapper,
    InputToken,
    ButtonPlain,
    ButtonDefault,
    ButtonTooltip,
    DownArrow,
    QuestionCircle,
    AnimatedSpinner,
    Head,
  },
  mixins: [approvalMixin, saveTokenSelectionMixin, setSwapRoutesMixin],
  data: () => ({
    tokenB: null,
    tokenA: null,
    amountTokenA: '',
    amountTokenB: '',
    isLastInputTokenA: true,
    balance: null,
    totalSupply: null,
    reserveTokenA: null,
    reserveTokenB: null,
    approving: false,
    swapping: false,
  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState('aeternity', ['slippage', 'fetchingPairInfo']),
    ...mapGetters(['WAE']),
    isAeVsWae() {
      return this.tokenA?.contract_id === this.WAE && this.tokenB?.contract_id === this.WAE;
    },
    enoughBalance() {
      return this.balance?.isGreaterThanOrEqualTo(this.amountTokenA);
    },
    approveBtnMessage() {
      if (this.fetchingAllowance) return `${this.$t('verifyingApproval')}...`;
      if (this.approving) return `${this.$t('approving')}...`;
      return this.$t('swap.allowDEX', { token: this.tokenA.symbol });
    },
    isValidAmount() {
      return !(
        !this.amountTokenA
        || !this.amountTokenB
        || Number.parseFloat(this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB) <= 0
      );
    },
    hasRoute() {
      return !!this.selectedRoute;
    },
    isDisabled() {
      return !this.tokenB || !this.tokenA || !this.isValidAmount
             || !this.enoughBalance || (!this.hasRoute && !this.isAeVsWae);
    },
    enoughAllowance() {
      if (!this.tokenA) return false;
      if (this.isAeVsWae || this.tokenA.is_ae) return true;
      return this.enoughTokenAllowance(
        this.tokenA.contract_id,
        this.amountTokenA,
        this.tokenA.decimals,
      );
    },
    buttonMessage() {
      if (this.swapping) return `${this.$t('swapping')}...`;
      if (!this.address) return this.$t('connectWallet');
      if (this.factory && this.tokenB && this.tokenA
        && !this.fetchingPairInfo && !this.isAeVsWae && !this.hasRoute) return this.$t('NoLiquidityFound');
      if (!this.isValidAmount || !this.tokenB || !this.tokenA) return this.$t('enterAmount');
      if (!this.enoughBalance) return this.$t('insufficientBalance', { msg: this.tokenA.symbol });
      return this.$t('swap.button');
    },
    amountTokenAExpanded() {
      return !this.tokenA || !this.amountTokenA
        ? 0 : expandDecimals(this.amountTokenA, this.tokenA.decimals);
    },
    amountTokenBExpanded() {
      return !this.tokenB || !this.amountTokenB
        ? 0 : expandDecimals(this.amountTokenB, this.tokenB.decimals);
    },
  },
  watch: {
    async address(newVal) {
      if (newVal && this.tokenA) {
        await this.refreshAllowance(this.tokenA.contract_id, this.fetchAllowance);
      }
    },
  },
  methods: {
    generateSwapMessage(isFinished) {
      return `${isFinished ? this.$t('swap.button') : this.$t('swapping')} ${this.isLastInputTokenA ? this.$t('exact') : ''} ${this.amountTokenA}
        ${this.tokenA.symbol} ${this.$t('for')} ${this.isLastInputTokenA ? '' : this.$t('exact')} ${this.amountTokenB} ${this.tokenB.symbol}`;
    },
    async approve() {
      try {
        this.approving = true;
        const aePair = getAePair(this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB);
        if (!aePair || aePair.isTokenFrom) {
          this.createAndRefreshAllowance(this.tokenA, this.amountTokenA);
        }
      } catch (e) {
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.approving = false;
      }
    },
    async clickHandler() {
      if (this.address) {
        this.swap();
      } else {
        this.$store.dispatch('modals/open', { name: 'connect-wallet' });
      }
    },
    async swapProcess() {
      const aePair = getAePair(this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB);
      // if none of the selected tokens are WAE
      if (!aePair) {
        return this.callSwapAction(
          this.isLastInputTokenA ? 'swapExactTokensForTokens' : 'swapTokensForExactTokens',
        );
      }
      if (aePair.isTokenFrom) {
        return this.callSwapAction(this.isLastInputTokenA ? 'swapExactTokensForAe' : 'swapTokensForExactAe');
      }
      return this.callSwapAction(this.isLastInputTokenA ? 'swapExactAeForTokens' : 'swapAeForExactTokens');
    },
    async swapAeVsWaeProcess() {
      return this.$store.dispatch(`aeternity/${this.tokenA.is_ae ? 'swapExactAeForExactWae' : 'swapExactWaeForExactAe'}`, {
        amount: this.amountTokenAExpanded,
        transactionInfo: this.generateSwapMessage(true),
      });
    },
    getPath() {
      return getPath(
        this.selectedRoute,
        this.tokenA.contract_id,
      );
    },
    callSwapAction(action) {
      return this.$store.dispatch(`aeternity/${action}`, {
        amountIn: this.amountTokenAExpanded,
        amountOut: this.amountTokenBExpanded,
        path: this.getPath(),
        transactionInfo: this.generateSwapMessage(true),
      });
    },
    async swap() {
      try {
        await this.$store.dispatch('modals/open', {
          name: 'confirm-swap',
          from: this.tokenA,
          to: this.tokenB,
          amountFrom: this.amountTokenA,
          amountTo: this.amountTokenB,
          ratio: this.ratio,
          priceImpact: this.priceImpact,
          isLastAmountFrom: this.isLastInputTokenA,
          isAeVsWae: this.isAeVsWae,
          numberOfPairs: this.getPath().length - 1,
          receivedTokensByPriceImpact: this.receivedTokensByPriceImpact,
        });
        this.swapping = true;
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: this.generateSwapMessage(),
          work: this.isAeVsWae ? this.swapAeVsWaeProcess : this.swapProcess,
        });
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.swapping = false;
        this.amountTokenA = '';
        this.amountTokenB = '';
        this.isLastInputTokenA = true;
        await this.setSwapRoutes();
        await this.refreshAllowance(this.tokenA?.contract_id, this.fetchAllowance);
        this.$store.commit('navigation/setSwap', null);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.swap-view {
  .input-token:first-of-type {
    margin-bottom: -8px;
  }

  .swap-button + .input-token {
    margin-top: -8px;
  }

  .swap-button {
    padding: 4px;
    border-radius: 12px;
    height: 32px;
    width: 32px;
    margin-top: -14px;
    margin-bottom: -14px;
    background-color: variables.$color-black2;
    border: 4px solid variables.$color-black3;

    &:hover {
      opacity: 0.8;
    }
  }

  .price {
    height: 24px;
    display: flex;
    color: white;
    justify-content: flex-end;
    align-items: center;
    margin-top: 8px;

    @extend %face-sans-14-medium;
  }

  .fetching-pair-info {
    height: 24px;
    display: flex;
    color: white;
    justify-content: flex-end;
    align-items: center;
    margin-top: 8px;

    @extend %face-sans-14-medium;

    svg {
      width: 22px;
      margin-right: 6px;
    }
  }

  .button-default {
    width: 100%;
    padding: 16px;
    margin-top: 12px;
    border-radius: 16px;

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

        img {
          margin-right: 8px;
        }
      }

      img,
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
}
</style>
