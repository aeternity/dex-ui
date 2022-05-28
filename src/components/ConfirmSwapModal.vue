<template>
  <ModalDefault
    class="confirm-swap-modal"
    title="Confirm Swap"
    close
    @close="denyHandler"
  >
    <TokenAmountDetails
      label="From"
      :symbol="from.symbol"
      :contract="from.contract_id"
      :amount="amountFrom"
    />
    <div class="arrow">
      <DownArrow />
    </div>
    <TokenAmountDetails
      label="To"
      :symbol="to.symbol"
      :contract="to.contract_id"
      :amount="amountTo"
    />
    <div class="estimation">
      {{ isLastAmountFrom ? 'Output' : 'Input' }} is estimated.
      {{ isLastAmountFrom? 'You will receive at least' : 'You will spend no more than' }}
      <strong>{{ receivedOrSpentValueMsg }}</strong>
      or the transaction will revert.
    </div>
    <div class="transaction-details">
      <div class="title no-border">
        Transaction Details
      </div>
      <div>
        <span>Price</span>
        <span>{{ `1 ${to.symbol} = ${ratio} ${from.symbol}` }}</span>
      </div>
      <!-- <div v-if="!isAeVsWae">
        <span>Liquidity Provider Fee</span>
        <span>{{ `${(amountFrom * 0.003).toFixed(8)} ${from.symbol}` }}</span>
      </div> -->
      <!-- <div v-if="!isAeVsWae">
        <span>Price Impact</span>
        <span>{{ priceImpact.toFixed(8) }}%</span>
      </div> -->
      <div v-if="!isAeVsWae">
        <span>Allowed Slippage</span>
        <span>{{ slippage }}%</span>
      </div>
      <div class="no-border">
        <span>{{ isLastAmountFrom? 'Minimum received' : 'Maximum spent' }}</span>
        <span>{{ receivedOrSpentValueMsg }}</span>
      </div>
    </div>
    <ButtonDefault @click="allowHandler">
      Confirm Swap
    </ButtonDefault>
  </ModalDefault>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import ModalDefault from './ModalDefault.vue';
import TokenAmountDetails from './TokenAmountDetails.vue';
import ButtonDefault from './ButtonDefault.vue';
import DownArrow from '../assets/arrow-down.svg?vue-component';

export default {
  components: {
    ModalDefault,
    TokenAmountDetails,
    ButtonDefault,
    DownArrow,
  },
  props: {
    from: { type: Object, required: true },
    to: { type: Object, required: true },
    amountFrom: { type: [String, Number], required: true },
    amountTo: { type: [String, Number], required: true },
    ratio: { type: [String, Number], required: true },
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
    priceImpact: { type: [Object, Number], required: true },
    isLastAmountFrom: { type: Boolean, required: true },
    isAeVsWae: { type: Boolean },
  },
  computed: {
    ...mapState('aeternity', ['slippage']),
    minimumReceived() {
      return BigNumber(this.amountTo).minus(
        this.isAeVsWae
          ? 0
          : BigNumber(this.amountTo).times(this.slippage).div(100),
      );
    },
    maximumSpent() {
      return BigNumber(this.amountFrom).plus(
        this.isAeVsWae
          ? 0
          : BigNumber(this.amountFrom).times(this.slippage).div(100),
      );
    },
    receivedOrSpentValueMsg() {
      return this.isLastAmountFrom
        ? `${this.minimumReceived} ${this.to.symbol}`
        : `${this.maximumSpent} ${this.from.symbol}`;
    },
  },
  methods: {
    denyHandler() {
      this.reject(new Error('Rejected by user'));
    },
    allowHandler() {
      this.resolve();
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.confirm-swap-modal {
  color: white;

  :deep(.body) {
    padding: 0 16px 16px 16px;
  }

  .arrow {
    display: inline-block;
    padding: 4px;
    border-radius: 12px;
    height: 32px;
    width: 32px;
    margin-top: -14px;
    margin-bottom: -14px;
    left: calc(50% - 16px);
    background-color: variables.$color-black2;
    border: 4px solid variables.$color-black3;
  }

  .token-amount-details:first-of-type {
    margin-bottom: -8px;
  }

  .arrow + .token-amount-details {
    margin-top: -8px;
  }

  .test-component:first-of-type {
    margin-bottom: -8px;
  }

  .arrow + .test-component {
    margin-top: -8px;
  }

  .transaction-details {
    display: flex;
    flex-direction: column;
    margin-top: 8px;

    @extend %face-sans-15-medium;

    > div {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid variables.$color-black2;

      span:first-of-type {
        margin-right: 4px;
        color: variables.$color-gray2;
      }
    }

    @include mixins.phone {
      > div,
      span {
        display: block;
        text-align: left;
      }
    }

    .title {
      margin-top: 0;
      color: variables.$color-white;
      padding-bottom: 8px;
    }

    .no-border {
      border-bottom: none;
    }
  }

  .estimation {
    color: variables.$color-gray2;
    padding: 12px 0;
    text-align: left;

    @extend %face-sans-14-medium;

    strong {
      color: variables.$color-white;
      font-weight: bold;
    }
  }

  .button-default {
    margin-top: 10px;
    padding: 16px;
    font-size: 20px;
    width: 100%;
  }
}
</style>
