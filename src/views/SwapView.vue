<template>
  <MainWrapper
    title="Swap"
    settings
    class="swap-view"
  >
    <InputToken
      :value="amountTokenA"
      :token="tokenA"
      :chosen-tokens="(tokenB || tokenA) && [tokenA, tokenB]"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balance = $event"
    />
    <ButtonPlain
      class="swap-button"
      @click="setSelectedToken(null)"
    >
      <DownArrow />
    </ButtonPlain>
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      :chosen-tokens="(tokenB || tokenA) && [tokenB, tokenA]"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
    />
    <div
      v-if="fetchingPairInfo"
      class="fetching-pair-info"
    >
      <AnimatedSpinner />
      <span>Fetching best price...</span>
    </div>
    <div
      v-else-if="tokenB && tokenA && ratio"
      class="price"
    >
      {{ `1 ${tokenB.symbol} = ${ratio} ${tokenA.symbol}` }}
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      class="allowance-button"
      :disabled="approving || !tokenA || !amountTokenA || fetchingPairInfo || fetchingAllowance
        || enoughAllowance"
      @click="approve"
    >
      <div class="allowance">
        <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
        {{ approveBtnMessage }}
      </div>
      <ButtonTooltip
        :tooltip="`You must give the DEX smart contracts permission to use your ${tokenA.symbol}.
          You only have to do this once per token.`"
      >
        <QuestionCircle />
      </ButtonTooltip>
    </ButtonDefault>

    <ButtonDefault
      :fill="address ? 'blue' : 'transparent-blue'"
      :disabled="address && (connectingToWallet || isDisabled || approving || fetchingPairInfo
        || !enoughAllowance)"
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
import MainWrapper from '@/components/MainWrapper.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonPlain from '@/components/ButtonPlain.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import ButtonTooltip from '@/components/ButtonTooltip.vue';
import { expandDecimals, reduceDecimals, getAePair } from '../lib/utils';
import DownArrow from '../assets/arrow-down.svg?vue-component';
import QuestionCircle from '../assets/question-circle.svg?vue-component';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';
import saveTokenSelectionMixin from '../mixins/saveTokenSelectionMixin';
import setTokenPairInfoMixin from '../mixins/setTokenPairInfoMixin';
import approvalMixin from '../mixins/allowanceMixin';

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
  },
  mixins: [approvalMixin, saveTokenSelectionMixin, setTokenPairInfoMixin],
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
    WAE: process.env.VUE_APP_WAE_ADDRESS,
  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState('aeternity', ['slippage', 'fetchingPairInfo']),
    isAeVsWae() {
      return this.tokenA?.contract_id === this.WAE && this.tokenB?.contract_id === this.WAE;
    },
    enoughBalance() {
      return this.balance?.isGreaterThanOrEqualTo(this.amountTokenA);
    },
    approveBtnMessage() {
      if (this.fetchingAllowance) return 'Verifying approval...';
      if (this.approving) return 'Approving...';
      return `Allow the DEX Protocol to use your ${this.tokenA.symbol}`;
    },
    isValidAmount() {
      return !(
        !this.amountTokenA
        || !this.amountTokenB
        || Number.parseFloat(this.isLastInputTokenA ? this.amountTokenA : this.amountTokenB) <= 0
      );
    },
    hasPair() {
      return !!(this.totalSupply || this.reserveTokenA || this.reserveTokenB);
    },
    isDisabled() {
      return !this.tokenB || !this.tokenA || !this.isValidAmount || !this.enoughBalance;
    },
    enoughAllowance() {
      if (!this.tokenA) return false;
      if (this.isAeVsWae || this.tokenA.is_ae) return true;
      return this.enoughTokenAllowance(this.tokenA.contract_id,
        this.amountTokenA, this.tokenA.decimals);
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (this.factory && this.tokenB && this.tokenA
        && !this.fetchingPairInfo && !this.hasPair) return 'No liquidity pool found';
      if (!this.isValidAmount || !this.tokenB || !this.tokenA) return 'Enter amount';
      if (!this.enoughBalance) return `Insufficient ${this.tokenA.symbol} balance`;
      return 'Swap';
    },
    ratio() {
      if (this.isAeVsWae) return 1;
      if (!this.reserveTokenA || !this.reserveTokenB || !this.tokenA || !this.tokenB) return null;
      return reduceDecimals(this.reserveTokenA, this.tokenA.decimals)
        .div(reduceDecimals(this.reserveTokenB, this.tokenB.decimals)).toNumber();
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
      let result = null;
      const aePair = getAePair(this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB);
      // if none of the selected tokens are WAE
      if (!aePair) {
        if (this.isLastInputTokenA) {
          result = await this.callSwapAction('swapExactTokensForTokens');
        } else {
          result = await this.callSwapAction('swapTokensForExactTokens');
        }
      } else if (aePair.isTokenFrom) {
        if (this.isLastInputTokenA) {
          result = await this.callSwapAction('swapExactTokensForAe');
        } else {
          result = await this.callSwapAction('swapTokensForExactAe');
        }
      } else if (this.isLastInputTokenA) {
        result = await this.callSwapAction('swapExactAeForTokens');
      } else {
        result = await this.callSwapAction('swapAeForExactTokens');
      }

      await this.reset();

      return result;
    },
    async swapAeVsWaeProcess() {
      let result = null;
      if (this.tokenA.is_ae) {
        result = await this.$store.dispatch('aeternity/swapExactAeForExactWae', this.amountTokenAExpanded);
      } else {
        result = await this.$store.dispatch('aeternity/swapExactWaeForExactAe', this.amountTokenAExpanded);
      }

      await this.reset();

      return result;
    },
    async reset() {
      await this.setPairInfo();
      await this.refreshAllowance(this.tokenA?.contract_id, this.fetchAllowance);
      this.amountTokenA = '';
      this.amountTokenB = '';
      this.isLastInputTokenA = true;
      this.$store.commit('navigation/setSwap', null);
    },
    async callSwapAction(action) {
      const result = await this.$store.dispatch(`aeternity/${action}`, {
        amountIn: this.amountTokenAExpanded,
        amountOut: this.amountTokenBExpanded,
        path: [this.tokenA.contract_id, this.tokenB.contract_id],
      });
      return result;
    },
    async swap() {
      try {
        const priceImpact = this.isAeVsWae
          ? 0
          : await this.$store.dispatch('aeternity/getPriceImpact', {
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            amountA: expandDecimals(this.amountTokenA, this.tokenA.decimals),
          });
        await this.$store.dispatch('modals/open', {
          name: 'confirm-swap',
          from: this.tokenA,
          to: this.tokenB,
          amountFrom: this.amountTokenA,
          amountTo: this.amountTokenB,
          ratio: this.ratio,
          priceImpact,
          isLastAmountFrom: this.isLastInputTokenA,
          isAeVsWae: this.isAeVsWae,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: `Swapping ${this.amountTokenA} ${this.tokenA.symbol} for ${this.amountTokenB} ${this.tokenB.symbol}`,
          work: this.isAeVsWae ? this.swapAeVsWaeProcess : this.swapProcess,
        });
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
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
