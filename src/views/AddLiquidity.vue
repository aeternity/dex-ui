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
    <ButtonDefault v-if="!isDisabled && address">
      {{ `Approve ${to.symbol}` }}
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
    testRatio: 0.0005,
    balanceFrom: null,
    balanceTo: null,
  }),
  computed: {
    ...mapState(['address']),
    enoughFromBalance() {
      return this.balanceFrom && this.balanceFrom.isGreaterThanOrEqualTo(this.amountFrom);
    },
    enoughToBalance() {
      return this.balanceTo && this.balanceTo.isGreaterThanOrEqualTo(this.amountTo);
    },
    isDisabled() {
      return this.address
        && (!this.to || !this.from || !this.amountFrom
        || !this.enoughToBalance || !this.enoughFromBalance);
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
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        handleUnknownError(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.add-liquidity {
  .input-token {
    margin: 20px 0;
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
      border: 1px solid rgb(44, 47, 54);
      background-color: rgb(33, 36, 41);
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
          color: rgb(195, 197, 203);
        }
      }
    }
  }
}
</style>
