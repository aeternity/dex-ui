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
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import NavigationMenu from '@/components/NavigationMenu.vue';

export default {
  components: {
    Header,
    NavigationMenu,
  },
  computed: {
    ...mapGetters('modals', ['opened']),
    ...mapState(['wallet', 'address']),
  },
  async mounted() {
    this.$store.commit('tokens/initDefaultTokens');
    this.$store.dispatch('analytics/init');

    const query = {
      // safari vue-router issue
      address: (new URLSearchParams(window.location.search)).get('address'),
      ...this.$route.query,
    };

    if (query.address) {
      this.$store.commit('setConnectingToWallet', true);
    }

    if (this.$isMobile) {
      await this.$store.dispatch('initUniversal'); // TODO: remove after https://github.com/aeternity/aepp-sdk-js/issues/1390 is resolved
      this.$store.dispatch('parseAndSendTransactionFromQuery');
    } else {
      await this.$store.dispatch('initSdk');
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
      await this.$store.dispatch('connectWallet', this.wallet);
    }
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
  transform: translate(50%, -50%);
  margin: 0 auto;
  display: none;
  justify-content: center;

  @include mixins.laptop {
    display: flex;
  }
}
</style>

<style lang="scss" src="./styles/globals.scss" />
