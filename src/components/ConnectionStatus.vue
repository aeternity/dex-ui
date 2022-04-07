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
import { fetchJson, handleUnknownError } from '../lib/utils';

export default {
  data: () => ({
    middlewareStatus: { loading: true },
  }),
  computed: {
    ...mapGetters(['activeNetwork']),
    ...mapState({
      message({ onLine, sdk, isSdkInitializing }) {
        if (!onLine) return { text: 'You are offline... Please check your connection.' };
        if (!isSdkInitializing && !sdk) return { text: 'We are unable to connect to the chosen node.' };
        if (isSdkInitializing) return { text: 'Connecting to the network...', className: 'connecting' };
        if (!this.middlewareStatus) {
          return {
            text: 'Middleware is not available, some functionality may not work properly.',
            className: 'connecting',
          };
        }
        if (!this.middlewareStatus.loading && !this.middlewareStatus.mdw_synced) {
          return {
            text: `Blocks to sync ${this.middlewareStatus.node_height - this.middlewareStatus.mdw_height}`,
            className: 'connecting',
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

  @include mixins.phone {
    width: 100%;
  }

  &.connecting {
    background-color: variables.$color-blue;
  }
}
</style>
