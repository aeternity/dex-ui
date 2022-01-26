<template>
  <ModalDefault
    class="confirm-swap-modal"
    title="Confrim Swap"
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
      <img src="../assets/arrow-down.svg">
    </div>
    <TokenAmountDetails
      label="To"
      :symbol="to.symbol"
      :contract="to.contract_id"
      :amount="amountTo"
    />
    <div class="price">
      Price
      <span>{{ `1 ${to.symbol} = ${ratio} ${from.symbol}` }}</span>
    </div>
    <div class="transaction-details">
      <div class="title">
        Transaction Details
      </div>
      <div v-if="!isAeVsWae">
        <span>Liquidity Provider Fee</span>
        <span>{{ `${(amountFrom*0.03).toFixed(8)} ${from.symbol}` }}</span>
      </div>
      <div v-if="!isAeVsWae">
        <span>Price Impact</span>
        <span>{{ priceImpact.toFixed(8) }}%</span>
      </div>
      <div v-if="!isAeVsWae">
        <span>Allowed Slippage</span>
        <span>{{ slippage }}%</span>
      </div>
      <div>
        <span>{{ isLastAmountFrom? 'Minimum received' : 'Maximum spent' }}</span>
        <span>{{ receivedOrSpentValueMsg }}</span>
      </div>
    </div>
    <div class="estimation">
      {{ isLastAmountFrom ? 'Output' : 'Input' }} is estimated.
      {{ isLastAmountFrom? 'You will receive at least' : 'You will spend no more than' }}
      <b>{{ receivedOrSpentValueMsg }}</b>
      or the transaction will revert.
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

export default {
  components: {
    ModalDefault,
    TokenAmountDetails,
    ButtonDefault,
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

.confirm-swap-modal {
  color: white;

  :deep(.body) {
    padding: 0px 16px 16px 16px;
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

  .test-component:first-of-type {
    margin-bottom: -8px;
  }

  .arrow + .test-component {
    margin-top: -8px;
  }

  .price {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding: 0 16px;
    font-size: 14px;
    color: variables.$color-white2;

    > span {
      color: white;
    }
  }

  .transaction-details {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    padding: 12px;
    border: 1px solid variables.$color-black;
    background-color: variables.$color-black2;
    border-radius: 16px;

    @extend %face-sans-14-regular;

    > div {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;

      span:first-of-type {
        margin-right: 4px;
      }
    }

    .title {
      margin-top: 0;
      border-bottom: 1px solid variables.$color-black;
      padding-bottom: 8px;
    }
  }

  .estimation {
    max-width: 380px;
    padding: 12px 16px;
    text-align: left;
    color: variables.$color-white2;

    @extend %face-sans-12-regular;
  }

  .button-default {
    margin-top: 10px;
    padding: 16px;
    font-size: 20px;
    width: 100%;
  }
}
</style>
