<template>
  <MainWrapper
    title="Swap"
    settings
    class="swap-view"
  >
    <InputToken
      :value="amountFrom"
      :token="from"
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
      :value="amountTo"
      :token="to"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
    />
    <div
      v-if="to && from && ratio"
      class="price"
    >
      {{ `1 ${to.symbol} = ${ratio} ${from.symbol}` }}
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      class="allowance-button"
      :disabled="amountFrom && (isAeVsWae || allowanceFrom === amountFrom)"
      @click="approve"
    >
      <div class="allowance">
        <img :src="`https://avatars.z52da5wt.xyz/${from.contract_id}`">
        {{ `Allow the DEX Protocol to use your ${from.symbol}` }}
      </div>
      <ButtonTooltip
        :tooltip="`You must give the DEX smart contracts permission to use your ${from.symbol}.
          You only have to do this once per token.`"
      >
        <QuestionCircle />
      </ButtonTooltip>
    </ButtonDefault>

    <ButtonDefault
      :fill="address ? 'blue' : 'transparent-blue'"
      :disabled="connectingToWallet || isDisabled"
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
import {
  expandDecimals, reduceDecimals, calculateSelectedToken, getAePair,
  handleUnknownError,
} from '../lib/utils';
import DownArrow from '../assets/arrow-down.svg?vue-component';
import QuestionCircle from '../assets/question-circle.svg?vue-component';

const WAE = process.env.VUE_APP_WAE_ADDRESS;

export default {
  components: {
    MainWrapper,
    InputToken,
    ButtonPlain,
    ButtonDefault,
    ButtonTooltip,
    DownArrow,
    QuestionCircle,
  },
  data: () => ({
    to: null,
    from: null,
    amountFrom: '',
    amountTo: '',
    isLastAmountFrom: true,
    balance: null,
    totalSupply: null,
    allowanceFrom: null,
    allowanceTo: null,
    reserveFrom: null,
    reserveTo: null,
  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState({
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    isAeVsWae() {
      return this.from?.contract_id === WAE && this.to?.contract_id === WAE;
    },
    enoughBalance() {
      return this.balance?.isGreaterThanOrEqualTo(this.amountFrom);
    },
    isDisabled() {
      return this.address && (!this.to || !this.from || !this.amountFrom || !this.enoughBalance);
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (!this.amountFrom || !this.amountTo || !this.to || !this.from) return 'Enter amount';
      if (!this.enoughBalance) return `Insufficient ${this.from.symbol} balance`;
      return 'Swap';
    },
    ratio() {
      if (this.isAeVsWae) return 1;
      if (!this.reserveFrom || !this.reserveTo || !this.from || !this.to) return null;
      return reduceDecimals(this.reserveFrom, this.from.decimals)
        .div(reduceDecimals(this.reserveTo, this.to.decimals)).toNumber();
    },
    amountFromExpanded() {
      return !this.from || !this.amountFrom
        ? 0 : expandDecimals(this.amountFrom, this.from.decimals);
    },
    amountToExpanded() {
      return !this.to || !this.amountTo ? 0 : expandDecimals(this.amountTo, this.to.decimals);
    },
  },
  watch: {
    async factory(newVal) {
      // we have wallet connection
      if (newVal && this.to && this.from) {
        await this.setPairInfo();
        if (this.amountFrom || this.amountTo) {
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
        this.isLastAmountFrom = !this.isLastAmountFrom;

        const swapAllowance = this.allowanceFrom;
        this.allowanceFrom = this.allowanceTo;
        this.allowanceTo = swapAllowance;

        const swapReserve = this.reserveFrom;
        this.reserveFrom = this.reserveTo;
        this.reserveTo = swapReserve;
      } else if (isFrom && oldFrom && this.from && oldFrom.contract_id !== this.from.contract_id) {
        this.allowanceFrom = null;
      } else if (oldTo && this.to && oldTo.contract_id !== this.to.contract_id) {
        this.allowanceTo = null;
      }
      if (!swapped) {
        await this.setPairInfo();
      }
      this.setAmount(
        this.isLastAmountFrom ? this.amountFrom : this.amountTo, this.isLastAmountFrom,
      );
    },
    async setPairInfo() {
      try {
        [
          this.totalSupply,
          this.reserveFrom,
          this.reserveTo,
        ] = await this.$store.dispatch('aeternity/getPairInfo', {
          tokenA: this.from,
          tokenB: this.to,
        });
      } catch (e) {
        handleUnknownError(e);
      }
    },
    setAmount(amount, isFrom) {
      this.isLastAmountFrom = isFrom;
      if (isFrom) {
        this.amountFrom = amount;
        this.amountTo = this.ratio && amount ? amount / this.ratio : '';
      } else {
        this.amountTo = amount;
        this.amountFrom = this.ratio && amount ? amount * this.ratio : '';
      }
    },
    async approve() {
      try {
        const aePair = getAePair(this.from, this.to, this.amountFrom, this.amountTo);
        if (!aePair || aePair.isTokenFrom) {
          await this.$store.dispatch('aeternity/createTokenAllowance', {
            token: this.from.contract_id,
            amount: expandDecimals(this.amountFrom, this.from.decimals),
          });
          this.allowanceFrom = this.amountFrom;
        }
      } catch (e) {
        await this.$store.dispatch('showUnknownError', e);
      }
    },
    async clickHandler() {
      if (this.address) {
        this.swap();
      } else {
        await this.$watchUntilTruly(() => this.$store.state.sdk);
        await this.$store.dispatch('connectWallet');
      }
    },
    async swapProcess() {
      const aePair = getAePair(this.from, this.to, this.amountFrom, this.amountTo);
      // if none of the selected tokens are WAE
      if (!aePair) {
        if (this.isLastAmountFrom) {
          await this.callSwapAction('swapExactTokensForTokens');
        } else {
          await this.callSwapAction('swapTokensForExactTokens');
        }
      } else if (aePair.isTokenFrom) {
        if (this.isLastAmountFrom) {
          await this.callSwapAction('swapExactTokensForAe');
        } else {
          await this.callSwapAction('swapTokensForExactAe');
        }
      } else if (this.isLastAmountFrom) {
        await this.callSwapAction('swapExactAeForTokens');
      } else {
        await this.callSwapAction('swapAeForExactTokens');
      }
      await this.reset();
    },
    async swapAeVsWaeProcess() {
      if (this.from.is_ae) {
        await this.$store.dispatch('aeternity/swapExactAeForExactWae', this.amountFromExpanded);
      } else {
        await this.$store.dispatch('aeternity/swapExactWaeForExactAe', this.amountFromExpanded);
      }
      await this.reset();
    },
    async reset() {
      await this.setPairInfo();
      this.amountFrom = '';
      this.amountTo = '';
      this.allowanceFrom = null;
      this.allowanceTo = null;
      this.isLastAmountFrom = true;
    },
    callSwapAction(action) {
      return this.$store.dispatch(`aeternity/${action}`, {
        amountIn: this.amountFromExpanded,
        amountOut: this.amountToExpanded,
        path: [this.from.contract_id, this.to.contract_id],
      });
    },
    async swap() {
      try {
        const priceImpact = this.isAeVsWae
          ? 0
          : await this.$store.dispatch('aeternity/getPriceImpact', {
            tokenA: this.from.contract_id,
            tokenB: this.to.contract_id,
            amountA: expandDecimals(this.amountFrom, this.from.decimals),
          });
        await this.$store.dispatch('modals/open', {
          name: 'confirm-swap',
          from: this.from,
          to: this.to,
          amountFrom: this.amountFrom,
          amountTo: this.amountTo,
          ratio: this.ratio,
          priceImpact,
          isLastAmountFrom: this.isLastAmountFrom,
          isAeVsWae: this.isAeVsWae,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: `Swapping ${this.amountFrom} ${this.from.symbol} for ${this.amountTo} ${this.to.symbol}`,
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
    display: flex;
    color: white;
    justify-content: flex-end;
    margin-top: 8px;

    @extend %face-sans-14-medium;
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
