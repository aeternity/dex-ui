import { createApp } from 'vue';
import { sync } from 'vuex-router-sync';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

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
app.config.globalProperties.$isMobile = window.navigator.userAgent.includes('Mobi');

registerModals();

sync(store, router);

Sentry.init({
  app,
  dsn: process.env.VUE_APP_SENTRY_URL,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ['dex.prd.aepps.com', 'dex.dev.aepps.com', 'dex.aepps.com', /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

app.use(store).use(router).mount('#app');
