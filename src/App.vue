<template>
  <Header />
  <router-view />
  <div class="footer">
    <NavigationMenu />
  </div>
  <Component
    :is="component"
    v-for="{ component, key, props } in opened"
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
    ...mapState(['address']),
  },
  async mounted() {
    this.$store.commit('tokens/initDefaultTokens');

    if (this.$isMobile) {
      await this.$store.dispatch('initUniversal'); // TODO: remove after https://github.com/aeternity/aepp-sdk-js/issues/1390 is resolved
    } else {
      await this.$store.dispatch('initSdk');
    }
    await this.$watchUntilTruly(() => this.$store.state.sdk);

    try {
      await this.$store.dispatch('aeternity/init');
    } catch (error) {
      // TODO
    }

    if (this.$isMobile) {
      await this.$store.dispatch('addMobileWallet');
    } else if (this.address) {
      await this.$store.dispatch('scanForWallets');
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
