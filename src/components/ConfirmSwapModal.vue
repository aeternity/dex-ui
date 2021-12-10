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
      <span>{{ `1 ${to.symbol} = ${1 / ratio} ${from.symbol}` }}</span>
    </div>
    <div class="transaction-details">
      <div class="title">
        Transaction Details
      </div>
      <div>
        <span>Liquidity Provider Fee</span>
        <span>0.00015 AE</span>
      </div>
      <div>
        <span>Price Impact</span>
        <span>-1.45%</span>
      </div>
      <div>
        <span>Allowed Slippage</span>
        <span>0.50%</span>
      </div>
      <div>
        <span>Minimum received</span>
        <span>{{ `0.00099425 ${to.symbol}` }}</span>
      </div>
    </div>
    <div class="estimation">
      Output is estimated.
      You will receive at least
      <b>{{ `0.00099425 ${to.symbol}` }}</b>
      or the transaction will revert.
    </div>
    <ButtonDefault @click="allowHandler">
      Confirm Swap
    </ButtonDefault>
  </ModalDefault>
</template>

<script>
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
    background-color: rgb(33, 36, 41);
    border: 4px solid rgb(25, 27, 31);
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
    color: rgb(195, 197, 203);

    > span {
      color: white;
    }
  }

  .transaction-details {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    padding: 12px;
    border: 1px solid rgb(44, 47, 54);
    background-color: rgb(33, 36, 41);
    border-radius: 16px;
    font-weight: 400;
    font-size: 14px;

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
      border-bottom: 1px solid rgb(44, 47, 54);
      padding-bottom: 8px;
    }
  }

  .estimation {
    max-width: 380px;
    padding: 12px 16px;
    font-weight: 400;
    font-size: 12px;
    text-align: left;
    color: rgb(195, 197, 203);
  }

  .button-default {
    margin-top: 10px;
    padding: 16px;
    font-size: 20px;
    width: 100%;
  }
}
</style>
