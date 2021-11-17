<template>
  <Header />
  <router-view/>
  <div class="footer">
    <NavigationMenu  />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import NavigationMenu from '@/components/NavigationMenu.vue';

export default {
  components: {
    Header,
    NavigationMenu,
  },
  async mounted() {
    await this.$store.dispatch('initSdk');
  },
};
</script>

<style lang="scss">
@use './styles/variables.scss';

#app {
  font-family: variables.$font-sans;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.footer {
  position: fixed;
  bottom: 0;
  right: 50%;
  transform: translate(50%, -50%);
  margin: 0 auto;
  display: none;
  justify-content: center;
}

@media (max-width: 1100px) {
  .footer {
    display: flex;
  }
}
</style>
