<template>
  <ModalDefault
    :close="isConfirmed"
    class="submit-transaction-modal"
    @close="isConfirmed ? resolve() : null"
  >
    <AnimatedSpinner v-if="loading" class="spinner" />
    <SuccessIcon v-if="isConfirmed && !loading" />
    <ErrorIcon v-if="!isConfirmed && !loading" />
    <div class="transaction-status">
      <span class="status">
        {{
          loading
            ? $t('submitTransactionModal.waiting')
            : isConfirmed
              ? $t('submitTransactionModal.submitted')
              : $t('submitTransactionModal.error')
        }}
      </span>
      <template v-if="loading">
        <span v-if="submitMessage" class="swap-info">
          {{ submitMessage }}
        </span>
        <span class="guide">{{ $t('submitTransactionModal.confirm') }}</span>
      </template>
      <template v-else>
        <div v-if="isConfirmed">
          <div class="open-explorer">
            <a
              v-if="activeNetwork && hash"
              :href="`${activeNetwork.explorerUrl}/transactions/${hash}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
              {{ $t('viewExplorer') }}
            </a>
          </div>
          <ButtonDefault @click="resolve">
            {{ $t('close') }}
          </ButtonDefault>
        </div>
        <div v-else>
          <span class="guide">{{ $t('submitTransactionModal.rejected') }}</span>
          <ButtonDefault fill="light" @click="resolve">
            {{ $t('dismiss') }}
          </ButtonDefault>
        </div>
      </template>
    </div>
  </ModalDefault>
</template>

<script>
import { mapGetters } from 'vuex';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import SuccessIcon from '@/assets/check.svg';
import ErrorIcon from '@/assets/error.svg';
import ExternalLink from '@/assets/external-link.svg';
import ModalDefault from './ModalDefault.vue';
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    ModalDefault,
    ButtonDefault,
    AnimatedSpinner,
    SuccessIcon,
    ErrorIcon,
    ExternalLink,
  },
  props: {
    submitMessage: { type: String, default: '' },
    resolve: { type: Function, required: true },
    reject: { type: Function, required: true },
    work: { type: Function, required: true },
  },
  data: () => ({
    loading: false,
    isConfirmed: false,
    hash: null,
  }),
  computed: mapGetters(['activeNetwork']),
  async created() {
    try {
      this.loading = true;
      this.hash = null;
      const result = await this.work();
      this.hash = result.hash;
      if (this.$isMobile) this.resolve();
      this.isConfirmed = true;
    } catch (e) {
      this.reject(e);
      this.isConfirmed = false;
    } finally {
      this.loading = false;
    }
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
    padding: 0 16px 16px;

    span {
      margin-bottom: 12px;

      &.status {
        padding: 14px 0;

        @extend %face-sans-20-medium;
      }

      &.swap-info {
        font-size: 16px;
      }
    }

    .guide {
      color: variables.$color-gray2;
      margin: 16px 0;

      @extend %face-sans-15-medium;
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

        @extend %face-sans-15-medium;

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
