import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import cn from './locales/zh-cn.json';

const messages = {
  en,
  fr,
  ru,
  'zh-cn': cn,
};

function getLocale() {
  const browserLanguageCode = navigator.language.split('-')[0];
  return Object.keys(messages).includes(browserLanguageCode) ? browserLanguageCode : 'en';
}

export default createI18n({
  locale: getLocale(),
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages,
  pluralizationRules: {
    ru(choice, choicesLength) {
      if (choice === 0) {
        return 0;
      }

      const teen = choice > 10 && choice < 20;
      const endsWithOne = choice % 10 === 1;

      if (choicesLength < 4) {
        return !teen && endsWithOne ? 1 : 2;
      }
      if (!teen && endsWithOne) {
        return 1;
      }
      if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2;
      }

      return choicesLength < 4 ? 2 : 3;
    },
  },
});
