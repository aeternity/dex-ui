<template>
  <ModalDefault
    class="confirm-swap-modal"
    :title="$t('confirmSwapModal.title')"
    close
    @close="denyHandler"
  >
    <TokenAmountDetails
      :label="$t('confirmSwapModal.from')"
      :symbol="from.symbol"
      :token="from"
      :amount="amountFrom"
    />
    <div class="arrow">
      <DownArrow />
    </div>
    <TokenAmountDetails
      :label="$t('confirmSwapModal.to')"
      :symbol="to.symbol"
      :token="to"
      :amount="amountTo"
    />
    <div class="estimation">
      {{ isLastAmountFrom ? $t('confirmSwapModal.output') : $t('confirmSwapModal.input') }}
      {{ $t('confirmSwapModal.isEstimated') }}.
      {{
        isLastAmountFrom
          ? $t('confirmSwapModal.receiveAtLeast')
          : $t('confirmSwapModal.spendNoMore')
      }}
      <strong>{{ receivedOrSpentValueMsg }}</strong>
      {{ $t('transactionWillRevert') }}
    </div>
    <div class="transaction-details">
      <div class="title no-border">
        {{ $t('confirmSwapModal.transactionDetails') }}
      </div>
      <div>
        <span>{{ $t('price') }}</span>
        <span>{{ `1 ${to.symbol} = ${1 / ratio} ${from.symbol}` }}</span>
      </div>
      <div v-if="!isAeVsWae">
        <span>{{ $t('confirmSwapModal.allowedSlippage') }}</span>
        <span>{{ slippage }}%</span>
      </div>
      <div v-if="!isAeVsWae">
        <span>{{ $t('confirmSwapModal.priceImpact') }}</span>
        <span>{{ priceImpact?.toFixed(8) }}%</span>
      </div>
      <div class="no-border">
        <span>
          {{
            isLastAmountFrom ? $t('confirmSwapModal.minReceived') : $t('confirmSwapModal.maxSpent')
          }}
        </span>
        <span>{{ receivedOrSpentValueMsg }}</span>
      </div>
    </div>
    <div v-if="shouldShowWarning" class="warning">
      {{ $t('confirmSwapModal.priceImpactWarning') }}
    </div>
    <ButtonDefault @click="allowHandler">
      {{ $t('confirmSwapModal.title') }}
    </ButtonDefault>
  </ModalDefault>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import DownArrow from '@/assets/arrow-down.svg';
import ModalDefault from './ModalDefault.vue';
import TokenAmountDetails from './TokenAmountDetails.vue';
import ButtonDefault from './ButtonDefault.vue';

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
    numberOfPairs: { type: [Number], required: true },
    receivedTokensByPriceImpact: { type: [Object, String, Number], required: true },
  },
  computed: {
    ...mapState('aeternity', ['slippage']),
    minimumReceived() {
      return BigNumber(this.amountTo).minus(
        this.isAeVsWae ? 0 : BigNumber(this.amountTo).times(this.slippage).div(100),
      );
    },
    maximumSpent() {
      return BigNumber(this.amountFrom).plus(
        this.isAeVsWae ? 0 : BigNumber(this.amountFrom).times(this.slippage).div(100),
      );
    },
    receivedOrSpentValueMsg() {
      return this.isLastAmountFrom
        ? `${this.minimumReceived} ${this.to.symbol}`
        : `${this.maximumSpent} ${this.from.symbol}`;
    },
    shouldShowWarning() {
      if (this.isAeVsWae) return false;
      return BigNumber(this.receivedTokensByPriceImpact).lt(this.minimumReceived);
    },
  },
  methods: {
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

.confirm-swap-modal {
  color: white;

  :deep(.body) {
    padding: 0 16px 16px;
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

      > span:first-of-type {
        text-align: left;
        max-width: 100px;
      }
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

  .warning {
    margin-top: 8px;
    color: variables.$color-orange;
    text-align: justify;
    margin-bottom: 12px;
  }

  .button-default {
    margin-top: 10px;
    padding: 16px;
    font-size: 20px;
    width: 100%;
  }
}
</style>
