<template>
  <nav class="navigation-menu">
    <router-link :to="getSwapPath">
      {{ $t('nav.swap') }}
    </router-link>
    <router-link :to="getPoolPath">
      {{ $t('nav.pool') }}
    </router-link>
  </nav>
</template>
<script>
export default {
  computed: {
    getSwapPath() {
      const query = this.$store.state.navigation.swap;
      if (!query || this.$route.name === 'swap') {
        return `/${this.$i18n.locale}/swap`;
      }
      return { path: `/${this.$i18n.locale}/swap`, query };
    },
    getPoolPath() {
      const query = this.$store.state.navigation.pool;
      if (!query || this.$route.name === 'add-pool') {
        return `/${this.$i18n.locale}/pool`;
      }
      return { path: `/${this.$i18n.locale}/pool/add`, query };
    },
  },
};
</script>
<style lang="scss" scoped>
@use '../styles/variables.scss';

.navigation-menu {
  display: flex;
  border-radius: 16px;
  background: variables.$color-black3;
  padding: 4px;
  border: 1px solid variables.$color-black;

  a {
    color: variables.$color-white2;
    padding: 8px 12px;
    text-decoration: none;

    &:not(:last-of-type) {
      margin-right: 10px;
    }

    &:hover {
      color: white;
    }

    &.router-link-active {
      border-radius: 12px;
      color: white;
      background-color: variables.$color-black;
    }
  }
}
</style>
