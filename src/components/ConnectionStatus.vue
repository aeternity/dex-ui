<template>
  <div
    v-if="message"
    class="connection-status"
    :class="message.className"
  >
    {{ message.text }}
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { fetchJson, handleUnknownError } from '@/lib/utils';

export default {
  data: () => ({
    middlewareStatus: { loading: true },
  }),
  computed: {
    ...mapGetters(['activeNetwork']),
    ...mapState({
      message({ onLine, sdk, isSdkInitializing }) {
        if (!onLine) return { text: this.$t('connectionStatus.offline') };
        if (!isSdkInitializing && !sdk) return { text: this.$t('connectionStatus.unableToConnectChosenNode') };
        if (isSdkInitializing) return { text: this.$t('connectionStatus.connectingNetwork'), className: 'connecting' };
        if (!this.middlewareStatus) {
          return {
            text: this.$t('connectionStatus.middlewareNotAvailable'),
            className: 'warning',
          };
        }
        if (!this.middlewareStatus.loading && !this.middlewareStatus.mdw_synced
          && this.middlewareStatus.node_height - this.middlewareStatus.mdw_height > 15) {
          return {
            text: this.$t('connectionStatus.middlewareOutOfSync'),
            className: 'warning',
          };
        }
        return null;
      },
    }),
  },
  mounted() {
    this.fetchMiddlewareStatus();
  },
  methods: {
    async fetchMiddlewareStatus() {
      try {
        this.middlewareStatus = await fetchJson(`${this.activeNetwork.middlewareUrl}/status`);
      } catch (e) {
        handleUnknownError(e);
        this.middlewareStatus = !this.onLine ? { loading: true } : null;
      }
      setTimeout(this.fetchMiddlewareStatus, 3000);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/mixins.scss';

.connection-status {
  padding: 6px;
  color: #fff;
  text-align: center;
  background-color: variables.$color-red;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  @include mixins.phone {
    width: 100%;
    border-radius: unset;
  }

  &.connecting {
    background-color: variables.$color-primary-light;
  }

  &.warning {
    background-color: variables.$color-orange;
  }
}
</style>
