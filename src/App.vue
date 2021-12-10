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
import { mapGetters } from 'vuex';
import Header from '@/components/Header.vue';
import NavigationMenu from '@/components/NavigationMenu.vue';

export default {
  components: {
    Header,
    NavigationMenu,
  },
  computed: mapGetters('modals', ['opened']),
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
}

* {
  font-family: variables.$font-sans;
  box-sizing: border-box;
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

#tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -4px;
}

#tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -4px;
}

#tooltip[data-popper-placement^='left'] > #arrow {
  right: -4px;
}

#tooltip[data-popper-placement^='right'] > #arrow {
  left: -4px;
}

@media (max-width: 1100px) {
  .footer {
    display: flex;
  }
}
</style>
