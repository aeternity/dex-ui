import { createApp } from 'vue';
import { sync } from 'vuex-router-sync';
import App from './App.vue';
import router from './router';
import store from './store';
import registerModals from './router/modals';

const app = createApp(App);

app.config.globalProperties.$watchUntilTruly = function watchUntilTruly(getter) {
  return new Promise((resolve) => {
    const unwatch = this.$watch(
      getter,
      (value) => {
        if (!value) return;
        resolve();
        setTimeout(() => unwatch(), 3000);
      },
      { immediate: true },
    );
  });
};

registerModals();

sync(store, router);

app.use(store).use(router).mount('#app');
