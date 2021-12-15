<template>
  <ModalDefault
    close
    class="submit-transaction-modal"
    @close="clickHandler"
  >
    <img
      v-if="!isConfirmed"
      src="../assets/animated-spinner.svg"
    >
    <img
      v-else
      src="../assets/arrow-down.svg"
      class="arrow"
    >
    <div class="transaction-status">
      <span class="status">
        {{ isConfirmed ? 'Transaction Submitted' : 'Waiting For Confirmation' }}
      </span>
      <template v-if="!isConfirmed">
        <span class="swap-info">
          {{ `Swapping ${amountFrom} ${fromSymbol} for ${amountTo} ${toSymbol}` }}
        </span>
        <span class="guide">Confirm this transaction in your wallet</span>
      </template>
      <template v-else>
        <a
          href="https://aeternity.com/"
          target="_blank"
        >
          View on Explorer
        </a>
        <ButtonDefault @click="clickHandler">
          Close
        </ButtonDefault>
      </template>
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
    fromSymbol: { type: String, required: true },
    toSymbol: { type: String, required: true },
    amountFrom: { type: [String, Number], required: true },
    amountTo: { type: [String, Number], required: true },
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
  },
  data: () => ({
    isConfirmed: false,
  }),
  methods: {
    clickHandler() {
      if (this.isConfirmed) {
        this.resolve();
      } else {
        this.reject(new Error('Rejected by user'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.submit-transaction-modal {
  img {
    height: 100px;
    width: 100px;

    &.arrow {
      transform: rotate(180deg);
      border: 2px solid white;
      border-radius: 50px;
    }
  }

  .transaction-status {
    display: flex;
    flex-direction: column;
    color: white;
    padding: 16px;

    span {
      margin-bottom: 12px;

      &.status {
        @extend %face-sans-20-medium;
      }

      &.swap-info {
        font-size: 16px;
      }

      &.guide {
        font-size: 14px;
        color: variables.$color-gray;
        margin-bottom: 12px;
      }
    }

    > a {
      font-size: 14px;
      color: variables.$color-blue;
      text-decoration: none;
    }

    .button-default {
      margin-top: 12px;
      padding: 12px;
      font-size: 20px;
    }
  }
}
</style>
