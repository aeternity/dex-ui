<template>
  <ModalDefault
    class="confirm-add-modal"
    :title="isAdding
      ? $t('confirmLiquidityModal.willReceive') : $t('confirmLiquidityModal.beRemoved')"
    close
    @close="denyHandler"
  >
    <div class="wrapper">
      <div class="tokens-box">
        <div class="receive">
          {{ pairAmount ? pairAmount.toFixed(5) : '-' }}
        </div>
        <div class="tokens">
          <TokenIcon
            :token-a="tokenA"
            :token-b="tokenB"
          />
          {{ `${tokenA.symbol}/${tokenB.symbol} ${$t('poolTokens')}` }}
        </div>
      </div>
      <div
        v-if="!isAdding"
        class="estimation"
      >
        <i18n-t keypath="confirmLiquidityModal.estimation">
          <b>{{ minimumReceived(amountA).toFixed(5) }} {{ tokenA.symbol }}</b>
          <b>{{ minimumReceived(amountB).toFixed(5) }} {{ tokenB.symbol }}</b>
        </i18n-t>
      </div>
      <span
        v-else
        class="estimation"
      >
        <i18n-t keypath="confirmLiquidityModal.outputEstimated">
          <span>{{ slippage }}</span>
        </i18n-t>
      </span>
      <div class="transaction-details">
        <div class="title">
          {{
            isAdding
              ? $t('confirmLiquidityModal.supplyDetails')
              : $t('confirmLiquidityModal.removalDetails')
          }}
        </div>
        <div>
          <span>
            <i18n-t
              :keypath="isAdding
                ? 'confirmLiquidityModal.deposited' : 'confirmLiquidityModal.estimated'"
            >
              <span>{{ tokenA.symbol }}</span>
            </i18n-t>
          </span>
          <div>
            {{ amountA ? amountA.toFixed(5) : '-' }}
          </div>
        </div>
        <div>
          <span>
            <i18n-t
              :keypath="isAdding
                ? 'confirmLiquidityModal.deposited' : 'confirmLiquidityModal.estimated'"
            >
              <span>{{ tokenB.symbol }}</span>
            </i18n-t>
          </span>
          <div>
            {{ amountB ? amountB.toFixed(5) : '-' }}
          </div>
        </div>
        <div v-if="!isAdding">
          <span>{{ $t("confirmLiquidityModal.allowedSlippage") }}</span>
          <div>
            {{ slippage }}%
          </div>
        </div>
        <div class="rates">
          <span>{{ $t("confirmLiquidityModal.rates") }}</span>
          <span>
            1 {{ tokenA.symbol }} = {{ ratio ? (1 / ratio).toFixed(8) : '-' }} {{ tokenB.symbol }}
            <br>
            1 {{ tokenB.symbol }} = {{ ratio?.toFixed(8) ?? '-' }} {{ tokenA.symbol }}
          </span>
        </div>
        <div v-if="isAdding">
          <span>{{ $t("confirmLiquidityModal.yourPoolShare") }}</span>
          <div>{{ share ? share.toFixed(8) : '100.00000000' }} %</div>
        </div>
      </div>
      <ButtonDefault @click="allowHandler">
        {{ isAdding
          ? $t("confirmLiquidityModal.confirmAdding")
          : $t("confirmLiquidityModal.confirmRemoving") }}
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';
import TokenIcon from './TokenIcon.vue';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
    TokenIcon,
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
      this.reject(new Error(this.$t('errors.rejectedByUser')));
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

.confirm-add-modal {
  .wrapper {
    width: 100%;
    padding: 16px;
    color: white;
    text-align: left;

    .tokens-box {
      background-color: variables.$color-black2;
      padding: 12px 16px;
      border-radius: 16px;

      .receive {
        display: flex;
        align-items: center;

        @extend %face-sans-22-medium;
      }

      .tokens {
        margin-top: 12px;
        align-items: center;
        display: inline-flex;
        justify-content: flex-end;
        width: 100%;

        @extend %face-sans-18-medium;
      }

      .token-icon {
        margin-left: 4px;
        margin-right: 10px;

        :deep(img) {
          width: 20px;
          height: 20px;
        }
      }
    }

    .estimation {
      margin: 12px 0;
      display: block;
      color: variables.$color-gray2;

      @extend %face-sans-14-medium;

      b {
        color: variables.$color-white;
      }
    }

    .transaction-details {
      display: flex;
      flex-direction: column;
      margin-top: 18px;

      @extend %face-sans-15-medium;

      > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

      > div:first-child,
      > div:last-child {
        border-bottom: none;
      }
    }

    .button-default {
      margin-top: 20px;
      padding: 16px;
      font-size: 20px;
      width: 100%;
    }
  }
}
</style>
