<template>
  <ModalDefault
    :close="isConfirmed"
    class="submit-transaction-modal"
    @close="isConfirmed ? resolve() : null"
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
        <div>
          <div class="open-explorer">
            <a
              v-if="activeNetwork && hash"
              :href="`${activeNetwork.explorerUrl}/transactions/${hash}`"
              target="_blank"
            >
              <ExternalLink />
              Open transaction in explorer
            </a>
          </div>
          <ButtonDefault @click="resolve">
            Close
          </ButtonDefault>
        </div>
      </template>
    </div>
  </ModalDefault>
</template>

<script>
import { mapGetters } from 'vuex';
import ButtonDefault from './ButtonDefault.vue';
import ModalDefault from './ModalDefault.vue';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';
import DownArrow from '../assets/arrow-down.svg?vue-component';
import ExternalLink from '../assets/external-link.svg?vue-component';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
    AnimatedSpinner,
    DownArrow,
    ExternalLink,
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
  computed: mapGetters(['activeNetwork']),
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
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.submit-transaction-modal {
  :deep(.container) {
    width: 440px;
    max-width: 90%;
  }

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
        padding: 14px 0;

        @extend %face-sans-20-medium;
      }

      &.swap-info {
        font-size: 16px;
      }

      &.guide {
        font-size: 14px;
        color: variables.$color-gray;
        margin: 12px 0;
      }
    }

    a {
      font-size: 14px;
      color: variables.$color-primary;
      text-decoration: none;
    }

    .open-explorer {
      width: 100%;
      padding-bottom: 6px;

      a {
        display: inline-flex;
        align-items: center;

        svg {
          height: 12px;
          width: 12px;
          margin-right: 6px;
        }
      }
    }

    .button-default {
      margin-top: 12px;
      padding: 12px;
      font-size: 20px;
      width: 100%;
    }
  }
}
</style>
