<template>
  <NotificationDefault
    v-bind="$attrs"
    close
    class="notification-transaction-status"
  >
    <Alert v-if="error" />
    <Check v-else />
    <div class="info">
      <span>{{ info }}</span>
      <a
        :href="`${activeNetwork.explorerUrl}/transactions/${hash}`"
        target="_blank"
      >
        View in Explorer
      </a>
    </div>
  </NotificationDefault>
</template>

<script>
import { mapGetters } from 'vuex';
import NotificationDefault from './NotificationDefault.vue';
import Alert from '../assets/alert.svg?vue-component';
import Check from '../assets/check.svg?vue-component';

export default {
  components: { NotificationDefault, Alert, Check },
  props: {
    info: { type: String, required: true },
    hash: { type: String, required: true },
    error: { type: Boolean },
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
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    text-align: left;
    color: white;
    overflow: hidden;

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
