<template>
  <ModalDefault
    class="confirm-add-modal"
    :title="isAdding ? $t('confirmLiquidity.willReceive') : $t('confirmLiquidity.beRemoved')"
    close
    @close="denyHandler"
  >
    <div class="container">
      <div class="receive">
        {{ pairAmount ? pairAmount.toFixed(5) : '-' }}
        <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
        <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
      </div>
      <div class="tokens">
        {{ `${tokenA.symbol}/${tokenB.symbol} ${$t('poolTokens')}` }}
      </div>
      <span class="estimation">
        {{ $t('confirmLiquidity.beRemoved', { msg: slippage }) }}
      </span>
      <div class="transaction-details">
        <div>
          <span>{{ tokenA.symbol }}
            {{
              isAdding ? $t("confirmLiquidity.deposited") : $t("confirmLiquidity.estimated")
            }}
          </span>
          <div>
            <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
            {{ amountA ? amountA.toFixed(5) : '-' }}
          </div>
        </div>
        <div>
          <span>{{ tokenB.symbol }}
            {{
              isAdding
                ? $t("confirmLiquidity.deposited")
                : $t("confirmLiquidity.estimated")
            }}
          </span>
          <div>
            <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
            {{ amountB ? amountB.toFixed(5) : '-' }}
          </div>
        </div>
        <div class="rates">
          <span>{{ $t("confirmLiquidity.rates") }}</span>
          <div>
            <span>{{ `1 ${tokenA.symbol} = ${ratioB.toFixed(5)} ${tokenB.symbol}` }}</span>
            {{ `1 ${tokenB.symbol} = ${ratioA.toFixed(5)} ${tokenA.symbol}` }}
          </div>
        </div>
        <div v-if="isAdding">
          <span>{{ $t('shareOfPool') }}:</span>
          <div>{{ share ? share.toFixed(8) : '100.00000000' }} %</div>
        </div>
      </div>
      <div
        v-if="!isAdding"
        class="estimation"
      >
        {{ $t("receiveAtLeast") }}
        <b>{{ minimumReceived(amountA).toFixed(5) }} {{ tokenA.symbol }}</b>
        {{ $t("confirmLiquidity.addAtLeast") }}
        <b>{{ minimumReceived(amountB).toFixed(5) }} {{ tokenB.symbol }}</b>
        {{ $t("transactionWillRevert") }}.
      </div>
      <ButtonDefault @click="allowHandler">
        {{ $t("confirmLiquidity.confirm") }} {{ isAdding ? $t('supply') : $t('removal') }}
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
  },
  props: {
    isAdding: { type: Boolean, required: true },
    tokenA: { type: Object, required: true },
    tokenB: { type: Object, required: true },
    amountA: { type: Object, required: true },
    amountB: { type: Object, required: true },
    pairAmount: { type: Object, required: true },
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
    ratio: { type: [String, Number], required: true },
    share: { type: [String, Number], default: 0 },
  },
  computed: {
    ...mapState('aeternity', ['slippage']),
    ratioA() {
      if (this.ratio) {
        return BigNumber(this.ratio);
      }
      // this is for adding liquidity when there is no pool created yet
      return this.amountA && this.amountB
        ? this.amountA.div(this.amountB)
        : 1;
    },
    ratioB() {
      return BigNumber(1).div(this.ratioA);
    },
  },
  methods: {
    minimumReceived(amount) {
      return BigNumber(amount).minus(
        BigNumber(amount).times(this.slippage).div(100),
      );
    },
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
    margin: 12px 0;
    display: block;
    max-width: 380px;
    color: variables.$color-white2;

    @extend %face-sans-12-regular;
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
