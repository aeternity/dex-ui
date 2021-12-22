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
    await this.$store.dispatch('initSdk');
    if (this.address) {
      await this.$watchUntilTruly(() => this.$store.state.sdk);
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

@include mixins.laptop {
  .footer {
    display: flex;
  }
}
</style>

<style lang="scss" src="./styles/globals.scss" />
