<template>
  <nav class="navigation-menu">
    <router-link to="/swap" @click.prevent="navigateSwap">
      {{ $t('nav.swap') }}
    </router-link>
    <router-link to="/pool" @click.prevent="navigatePool">
      {{ $t('nav.pool') }}
    </router-link>
  </nav>
</template>
<script>
export default {
  methods: {
    navigateSwap() {
      const query = this.$store.state.navigation.swap;

      if (query && this.$route.name !== 'swap') {
        this.$router.push({ path: '/swap', query });
      } else if (this.$route.name === 'swap') {
        this.$store.commit('navigation/setSwap', null);
      }
    },
    navigatePool() {
      const query = this.$store.state.navigation.pool;
      if (query && this.$route.name === 'add-pool') {
        this.$store.commit('navigation/setPool', null);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

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

    @extend %face-sans-16-medium;

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
