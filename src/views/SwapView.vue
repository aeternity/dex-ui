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
      <img src="../assets/arrow-down.svg">
    </ButtonPlain>
    <InputToken
      :value="amountTo"
      :token="to"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
    />
    <div
      v-if="to && from && ratio != null"
      class="price"
    >
      {{ `1 ${to.symbol} = ${ratio} ${from.symbol}` }}
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      class="allowance-button"
      :disabled="hasAllowance"
      @click="approve"
    >
      <div class="allowance">
        <img :src="`https://avatars.z52da5wt.xyz/${from.contract_id}`">
        {{ `Allow the DEX Protocol to use your ${from.symbol}` }}
      </div>
      <ButtonTooltip
        :tooltip="`You must give the DEX smart contracts pernission to use your ${from.symbol}.
          You only have to do this once per token.`"
      >
        <img src="../assets/question-circle.svg">
      </ButtonTooltip>
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
import MainWrapper from '@/components/MainWrapper.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonPlain from '@/components/ButtonPlain.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import ButtonTooltip from '@/components/ButtonTooltip.vue';
import {
  expandDecimals, reduceDecimals, calculateSelectedToken, handleUnknownError,
} from '../lib/utils';

const WAE = process.env.VUE_APP_WAE_ADDRESS;

export default {
  components: {
    MainWrapper,
    InputToken,
    ButtonPlain,
    ButtonDefault,
    ButtonTooltip,
  },
  data: () => ({
    loading: false,
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
    ...mapState({
      address: 'address',
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    isAeVsWae() {
      return this.from && this.to && this.from.contract_id === WAE && this.to.contract_id === WAE;
    },
    enoughBalance() {
      return (this.from && this.from.contract_id === WAE)
      || this.balance?.isGreaterThanOrEqualTo(this.amountFrom);
    },
    hasAllowance() {
      return this.amountFrom != null
      && (this.isAeVsWae || this.allowanceFrom === this.amountFrom);
    },
    isDisabled() {
      return this.address && (!this.to || !this.from || !this.amountFrom || !this.enoughBalance);
    },
    buttonMessage() {
      if (!this.address) return 'Connect Wallet';
      if (!this.amountFrom || !this.amountTo) return 'Enter amount';
      if (!this.enoughBalance) return `Insufficient ${this.from.symbol} balance`;
      return 'Swap';
    },
    ratio() {
      if (this.isAeVsWae) {
        return 1;
      }
      if (!this.reserveFrom || !this.reserveTo || !this.from || !this.to) {
        return null;
      }
      return reduceDecimals(this.reserveFrom, this.from)
        .div(reduceDecimals(this.reserveTo, this.to)).toNumber();
    },
    path() {
      return !this.from || !this.to
        ? []
        : [this.from.contract_id, this.to.contract_id];
    },
    amountFromExpanded() {
      return !this.from || !this.amountFrom ? 0 : expandDecimals(this.amountFrom, this.from);
    },
    amountToExpanded() {
      return !this.to || !this.amountTo ? 0 : expandDecimals(this.amountTo, this.to);
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
      // TODO: what if it fails?
      await this.setPairInfo();
      this.setAmount(
        this.isLastAmountFrom ? this.amountFrom : this.amountTo, this.isLastAmountFrom,
      );
    },
    getAePair() {
      if (this.from && this.to) {
        if (this.from.is_ae) {
          return {
            isTokenFrom: false,
            token: this.to,
            tokenAmount: this.amountTo,
            wae: this.from,
            aeAmount: this.amountFrom,
          };
        } if (this.to.is_ae) {
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
        if (this.isAeVsWae) {
          this.totalSupply = 0;
          this.reserveFrom = 1;
          this.reserveTo = 1;
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
        if (isValid && amount != null) {
          this.amountTo = amount / this.ratio;
        }
      } else {
        this.amountTo = amount;
        if (isValid && amount != null) {
          this.amountFrom = amount * this.ratio;
        }
      }
    },
    async createAllowance(amount) {
      try {
        await this.$store.dispatch('aeternity/createTokenAllowance', {
          token: this.from.contract_id,
          amount: BigInt(BigNumber(10).pow(this.from.decimals).times(amount).toFixed()),
        });
      } catch (ex) {
        // TODO: this is a hack
        handleUnknownError(ex);
      }
    },
    async approve() {
      try {
        const aePair = this.getAePair();
        if (!aePair || aePair.isTokenFrom) {
          await this.createAllowance(this.amountFrom);
          this.allowanceFrom = this.amountFrom;
        }
      } catch (ex) {
        handleUnknownError(ex);
      }
    },
    clickHandler() {
      if (this.address) {
        this.swap();
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
    async swapProcess() {
      const aePair = this.getAePair();
      // if none of the selected tokens are WAE
      if (!aePair) {
        if (this.isLastAmountFrom) {
          await this.swapExactTokensForTokens();
        } else {
          await this.swapTokensForExactTokens();
        }
      } else if (aePair.isTokenFrom) {
        if (this.isLastAmountFrom) {
          await this.swapExactTokensForAe();
        } else {
          await this.swapTokensForExactAe();
        }
      } else if (this.isLastAmountFrom) {
        await this.swapExactAeForTokens();
      } else {
        await this.swapAeForExactTokens();
      }
      await this.reset();
    },
    async swapAeVsWaeProcess() {
      if (this.from.is_ae) {
        await this.$store.dispatch('aeternity/swapExactAeForExactWae',
          this.amountFromExpanded);
      } else {
        await this.$store.dispatch('aeternity/swapExactWaeForExactAe',
          this.amountFromExpanded);
      }
      await this.reset();
    },
    async reset() {
      await this.setPairInfo();
      this.amountFrom = null;
      this.amountTo = null;
      this.allowanceFrom = null;
      this.allowanceTo = null;
      this.isLastAmountFrom = true;
    },
    swapExactTokensForTokens() {
      return this.$store.dispatch('aeternity/swapExactTokensForTokens', {
        amountIn: this.amountFromExpanded,
        amountOutDesired: this.amountToExpanded,
        path: this.path,
      });
    },
    swapTokensForExactTokens() {
      return this.$store.dispatch('aeternity/swapTokensForExactTokens', {
        amountInDesired: this.amountFromExpanded,
        amountOut: this.amountToExpanded,
        path: this.path,
      });
    },
    swapExactTokensForAe() {
      return this.$store.dispatch('aeternity/swapExactTokensForAe', {
        amountIn: this.amountFromExpanded,
        amountAeOutDesired: this.amountToExpanded,
        path: this.path,
      });
    },
    swapTokensForExactAe() {
      return this.$store.dispatch('aeternity/swapTokensForExactAe', {
        amountTokenInDesired: this.amountFromExpanded,
        amountAeOut: this.amountToExpanded,
        path: this.path,
      });
    },
    swapExactAeForTokens() {
      return this.$store.dispatch('aeternity/swapExactAeForTokens', {
        amountAeIn: this.amountFromExpanded,
        amountOutDesired: this.amountToExpanded,
        path: this.path,
      });
    },
    swapAeForExactTokens() {
      return this.$store.dispatch('aeternity/swapAeForExactTokens', {
        amountAeInDesired: this.amountFromExpanded,
        amountOut: this.amountToExpanded,
        path: this.path,
      });
    },
    async swap() {
      try {
        const priceImpact = this.isAeVsWae
          ? 0
          : await this.$store.dispatch('aeternity/getPriceImpact', {
            tokenA: this.from.contract_id,
            tokenB: this.to.contract_id,
            amountA: expandDecimals(this.amountFrom, this.from),
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
          fromSymbol: this.from.symbol,
          toSymbol: this.to.symbol,
          amountFrom: this.amountFrom,
          amountTo: this.amountTo,
          work: this.isAeVsWae ? this.swapAeVsWaeProcess : this.swapProcess,
        });
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
}
</style>
