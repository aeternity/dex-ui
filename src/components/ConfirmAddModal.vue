<template>
  <ModalDefault
    class="confirm-add-modal"
    title="You will receive"
    close
    @close="denyHandler"
  >
    <div class="container">
      <div class="receive">
        {{ receive }}
        <img :src="`https://avatars.z52da5wt.xyz/${firstToken.contract_id}`">
        <img :src="`https://avatars.z52da5wt.xyz/${secondToken.contract_id}`">
      </div>
      <div class="tokens">
        {{ `${firstToken.symbol}/${secondToken.symbol} Pool Tokens` }}
      </div>
      <span class="estimation">
        Output is estimated. If the price changes by more than 0.5% your transaction will revert.
      </span>
      <div class="transaction-details">
        <div>
          <span>{{ `${firstToken.symbol} Deposited` }}</span>
          <div>
            <img :src="`https://avatars.z52da5wt.xyz/${firstToken.contract_id}`">
            {{ firstAmount }}
          </div>
        </div>
        <div>
          <span>{{ `${secondToken.symbol} Deposited` }}</span>
          <div>
            <img :src="`https://avatars.z52da5wt.xyz/${secondToken.contract_id}`">
            {{ secondAmount }}
          </div>
        </div>
        <div class="rates">
          <span>Rates</span>
          <div>
            <span>{{ `1 ${secondToken.symbol} = ${1 / 0.005} ${firstToken.symbol}` }}</span>
            {{ `1 ${firstToken.symbol} = ${0.005} ${secondToken.symbol}` }}
          </div>
        </div>
        <div>
          <span>Share of Pool:</span>
          <div>0.00001503%</div>
        </div>
      </div>
      <ButtonDefault @click="allowHandler">
        Confirm Supply
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script>
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
  },
  props: {
    receive: { type: [String, Number], required: true },
    firstToken: { type: Object, required: true },
    secondToken: { type: Object, required: true },
    firstAmount: { type: [String, Number], required: true },
    secondAmount: { type: [String, Number], required: true },
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
.confirm-add-modal .container {
  padding: 16px;
  color: white;
  text-align: left;

  img {
    width: 20px;
    height: 20px;
  }

  .receive {
    display: flex;
    align-items: center;
    font-size: 34px;

    img:nth-of-type(1) {
      margin-left: 4px;
      z-index: 1;
    }

    img:nth-of-type(2) {
      margin-left: -10px;
    }
  }

  .tokens {
    font-size: 24px;
    margin: 12px 0;
  }

  .estimation {
    display: block;
    max-width: 380px;
    font-weight: 400;
    font-size: 12px;
    color: rgb(195, 197, 203);
  }

  .transaction-details {
    display: flex;
    flex-direction: column;
    margin-top: 8px;

    > div {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;

      > div {
        display: flex;
        align-items: center;

        img {
          margin-right: 4px;
        }
      }

      &.rates > div {
        flex-direction: column;
      }
    }
  }

  .button-default {
    margin-top: 20px;
    padding: 16px;
    font-size: 20px;
    width: 100%;
  }
}
</style>
