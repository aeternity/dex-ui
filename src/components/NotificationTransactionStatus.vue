<template>
  <NotificationDefault
    v-bind="$attrs"
    close
    class="notification-transaction-status"
  >
    <Alert
      v-if="error"
      class="error"
    />
    <Check v-else />
    <div class="info">
      <span>{{ info }}</span>
      <div
        v-if="errorMessage"
        class="error"
      >
        {{ errorMessage }}
      </div>
      <a
        :href="`${activeNetwork.explorerUrl}/transactions/${hash}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t('viewExplorer') }}
      </a>
    </div>
  </NotificationDefault>
</template>

<script>
import { mapGetters } from 'vuex';
import Alert from '@/assets/alert.svg';
import Check from '@/assets/check.svg';
import NotificationDefault from './NotificationDefault.vue';

export default {
  components: { NotificationDefault, Alert, Check },
  props: {
    info: { type: String, required: true },
    hash: { type: String, required: true },
    error: { type: Boolean },
    errorMessage: { type: String, default: null },
  },
  computed: mapGetters(['activeNetwork']),
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.notification-transaction-status {
  :deep(.content) {
    display: flex;
    align-items: center;

    > svg {
      width: 32px;
      height: 32px;
      margin-right: 10px;
      color: variables.$color-green;
      min-width: 32px;

      &.error {
        color: variables.$color-red;
      }
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    text-align: left;
    color: white;
    overflow: hidden;

    .error {
      margin-top: 5px;
      color: variables.$color-red;
    }

    > a {
      margin-top: 8px;
      text-decoration: none;
      color: variables.$color-blue;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
