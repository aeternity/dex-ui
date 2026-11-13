import { createApp } from 'vue';
import { sync } from 'vuex-router-sync';
import * as Sentry from '@sentry/vue';
import { createHead } from '@unhead/vue/client';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import registerModals from './router/modals';

const app = createApp(App);
const head = createHead();

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

if (!window.location.host.includes('localhost')) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_URL,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracePropagationTargets: ['testnet.aeternity.io', 'mainnet.aeternity.io', /^\//],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

app.use(head).use(i18n).use(store).use(router).mount('#app');
