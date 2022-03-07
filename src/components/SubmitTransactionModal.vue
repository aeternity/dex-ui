<template>
  <ModalDefault
    close
    class="submit-transaction-modal"
    @close="clickHandler"
  >
    <AnimatedSpinner
      v-if="!isConfirmed"
      class="spinner"
    />
    <DownArrow v-else />
    <div class="transaction-status">
      <span class="status">
        {{ isConfirmed ? 'Transaction Submitted' : 'Waiting For Confirmation' }}
      </span>
      <template v-if="!isConfirmed">
        <span
          v-if="submitMessage"
          class="swap-info"
        >
          {{ submitMessage }}
        </span>
        <span class="guide">Confirm this transaction in your wallet</span>
      </template>
      <template v-else>
        <a
          v-if="hash"
          :href="transactionUrl"
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
import { mapGetters } from 'vuex';
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';
import AnimatedSpinner from '../assets/animated-spinner.svg?vue-component';
import DownArrow from '../assets/arrow-down.svg?vue-component';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
    AnimatedSpinner,
    DownArrow,
  },
  props: {
    submitMessage: { type: String, default: '' },
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
    work: { type: Function, required: true },
  },
  data: () => ({
    isConfirmed: false,
    hash: null,
  }),
  computed: {
    ...mapGetters(['activeNetwork']),
    transactionUrl() {
      return `${this.activeNetwork.explorerUrl}/transactions/${this.hash}`;
    },
  },
  async created() {
    try {
      this.hash = null;
      const result = await this.work();
      this.hash = result.hash;
      this.isConfirmed = true;
    } catch (e) {
      this.reject(e);
    }
  },
  methods: {
    clickHandler() {
      this.resolve();
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.submit-transaction-modal {
  svg {
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
