<template>
  <Header />
  <div id="notification-container">
    <Component
      :is="component"
      v-for="{ component, key, props } in opened.filter((m) => m.allowRedirect)"
      :key="key"
      v-bind="props"
    />
  </div>
  <router-view />
  <div class="footer">
    <NavigationMenu />
  </div>
  <Component
    :is="component"
    v-for="{ component, key, props } in opened.filter((m) => !m.allowRedirect)"
    :key="key"
    v-bind="props"
  />
  <ConnectionStatus />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import NavigationMenu from '@/components/NavigationMenu.vue';
import ConnectionStatus from '@/components/ConnectionStatus.vue';
import { isDexBackendDisabled } from '@/lib/utils';
import { IN_FRAME } from '@/lib/constants';

export default {
  components: {
    Header,
    NavigationMenu,
    ConnectionStatus,
  },
  data() {
    return {
      backendSanityCheckTimeoutId: null,
      walletExploreDelayed: false,
    };
  },
  computed: {
    ...mapGetters('modals', ['opened']),
    ...mapState(['wallet', 'address']),
    ...mapState('backend', { backendFailed: 'failed' }),
  },
  watch: {
    async backendFailed(newVal) {
      if (newVal) {
        await this.checkBackendStatus();
      }
    },
    $route(to) {
      if (!to.path.includes('/explore') && this.walletExploreDelayed) {
        this.walletExploreDelayed = false;
        this.$store.dispatch('connectWallet', { info: this.wallet });
      }
    },
  },
  async mounted() {
    if (this.$store.state.lang) this.$i18n.locale = this.$store.state.lang;

    this.$store.commit('tokens/initDefaultTokens');

    const query = {
      // safari vue-router issue
      address: new URLSearchParams(window.location.search).get('address'),
      networkId: new URLSearchParams(window.location.search).get('networkId'),
      ...this.$route.query,
    };

    if (query.address) {
      this.$store.commit('setConnectingToWallet', true);
    }
    this.$store.commit('setIsSdkInitializing', true);
    try {
      if (this.$isMobile && !IN_FRAME) {
        await this.$store.dispatch('initUniversal'); // TODO: remove after https://github.com/aeternity/aepp-sdk-js/issues/1390 is resolved
        setTimeout(() => this.$store.dispatch('parseAndSendTransactionFromQuery'), 1000);
      } else {
        await this.$store.dispatch('initSdk');
      }
    } catch (e) {
      this.$store.dispatch('showUnknownError', e);
    } finally {
      this.$store.commit('setIsSdkInitializing', false);
    }
    if (!isDexBackendDisabled) {
      await this.$store.dispatch('backend/init');
      this.checkBackendStatus();
    }

    await this.$watchUntilTruly(() => this.$store.state.sdk);

    try {
      await this.$store.dispatch('aeternity/init');
    } catch (error) {
      // TODO
    }

    if (query.address) {
      await this.$store.dispatch('connectDefaultWallet', query);
      delete query.address;
      delete query.networkId;
      this.$router.replace({ query });
    } else if (this.wallet && this.address) {
      if (this.$route.fullPath.includes('/explore')) {
        this.walletExploreDelayed = true;
      } else {
        await this.$store.dispatch('connectWallet', { info: this.wallet });
      }
    }
    if (
      this.$isMobile &&
      !query.address &&
      !query.transaction &&
      !query.networkId &&
      !this.$store.state.hasSeenOnboarding
    ) {
      this.$store.dispatch('showOnboarding');
    } else if (!this.$store.state.hasSeenOnboarding) {
      this.$store.commit('setOnboardingModalAsSeen');
    }
  },
  methods: {
    async checkBackendStatus() {
      clearTimeout(this.backendSanityCheckTimeoutId);
      if (isDexBackendDisabled) return;
      const up = await this.$store.dispatch('backend/checkStatus');
      if (!up) {
        this.backendSanityCheckTimeoutId = setTimeout(
          this.checkBackendStatus,
          parseInt(import.meta.env.VITE_DEX_BACKEND_FETCH_INTERVAL || '2000', 10),
        );
      }
    },
  },
};
</script>

<style lang="scss">
@use './styles/variables.scss';
@use './styles/mixins.scss';

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#notification-container {
  position: fixed;
  top: 10%;
  right: 1%;
  z-index: 1;

  @include mixins.phone {
    position: unset;

    > .notification-default {
      width: unset;
    }
  }
}

.footer {
  position: fixed;
  bottom: 0;
  right: 50%;
  transform: translate(50%, -80%);
  margin: 0 auto;
  display: none;
  justify-content: center;

  @include mixins.laptop {
    display: flex;
  }
}

.connection-status {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>

<style lang="scss" src="./styles/globals.scss" />
