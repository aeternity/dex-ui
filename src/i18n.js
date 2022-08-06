import { createI18n } from 'vue-i18n';

/**
 * Load locale messages
 * https://vue-i18n.intlify.dev
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`,
 * which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

function preferredLocale() {
  const code = navigator.language.split('-')[0];
  return require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i).keys()
    .map((key) => key.match(/([A-Za-z0-9-_]+)\./i)[1]).includes(code) ? code : '';
}

export default createI18n({
  locale: preferredLocale() || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
  pluralizationRules: {
    ru(choice, choicesLength) {
      if (choice === 0) {
        return 0;
      }

      const teen = choice > 10 && choice < 20;
      const endsWithOne = choice % 10 === 1;

      if (choicesLength < 4) {
        return (!teen && endsWithOne) ? 1 : 2;
      }
      if (!teen && endsWithOne) {
        return 1;
      }
      if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2;
      }

      return (choicesLength < 4) ? 2 : 3;
    },
  },
});
