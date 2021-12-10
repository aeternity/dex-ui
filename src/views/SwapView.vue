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
      v-if="to && from"
      class="price"
    >
      {{ `1 ${to.symbol} = ${1 / testRatio} ${from.symbol}` }}
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      class="allowance-button"
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
import MainWrapper from '@/components/MainWrapper.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonPlain from '@/components/ButtonPlain.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import ButtonTooltip from '@/components/ButtonTooltip.vue';
import { calculateSelectedToken, handleUnknownError } from '../lib/utils';

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
    testRatio: 0.0005,
    balance: null,
  }),
  computed: {
    ...mapState(['address']),
    enoughBalance() {
      return this.balance?.isGreaterThanOrEqualTo(this.amountFrom);
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
  },
  methods: {
    setSelectedToken(token, isFrom) {
      let swapped;
      [this.from, this.to, swapped] = calculateSelectedToken(token, this.from, this.to, isFrom);
      if (swapped) {
        const swap = this.amountFrom;
        this.amountFrom = this.amountTo;
        this.amountTo = swap;
        this.isLastAmountFrom = !this.isLastAmountFrom;
      }
      this.setAmount(
        this.isLastAmountFrom ? this.amountFrom : this.amountTo, this.isLastAmountFrom,
      );
    },
    setAmount(amount, isFrom) {
      this.isLastAmountFrom = isFrom;
      if (isFrom) {
        this.amountFrom = amount;
        this.amountTo = this.to && this.from ? amount * this.testRatio : '';
      } else {
        this.amountTo = amount;
        this.amountFrom = this.to && this.from ? amount / this.testRatio : '';
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
    async swap() {
      try {
        await this.$store.dispatch('modals/open', {
          name: 'confirm-swap',
          from: this.from,
          to: this.to,
          amountFrom: this.amountFrom,
          amountTo: this.amountTo,
          ratio: this.testRatio,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          fromSymbol: this.from.symbol,
          toSymbol: this.to.symbol,
          amountFrom: this.amountFrom,
          amountTo: this.amountTo,
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
    background-color: rgb(33, 36, 41);
    border: 4px solid rgb(25, 27, 31);

    &:hover {
      opacity: 0.8;
    }
  }

  .price {
    display: flex;
    color: white;
    justify-content: flex-end;
    margin-top: 8px;
    font-weight: 500;
    font-size: 14px;
  }

  .button-default {
    width: 100%;
    padding: 16px;
    margin-top: 8px;
    font-size: 20px;
    font-weight: 500;

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
