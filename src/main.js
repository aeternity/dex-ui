import { createApp } from 'vue';
import { sync } from 'vuex-router-sync';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
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

if (!window.location.host.includes('localhost')) {
  Sentry.init({
    app,
    dsn: process.env.VUE_APP_SENTRY_URL,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        // https://docs.sentry.io/platforms/javascript/guides/react/performance/instrumentation/automatic-instrumentation/#tracingorigins
        tracingOrigins: ['testnet.aeternity.io', 'mainnet.aeternity.io', /^\//],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

// use beforeEach route guard to set the language
router.beforeEach((to, from, next) => {
  // use the language from the routing param or default language
  let language = to.params.lang;
  const { global } = i18n;

  if (!language || !global.availableLocales.includes(language)) {
    language = 'en';
  }

  // set the current language for i18n.
  i18n.locale = language;
  next();
});

app.use(i18n).use(store).use(router).mount('#app');
