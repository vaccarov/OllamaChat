import { DEFAULT_APP_LANG } from '@/constants/langs';
import translationEN from '@/locales/en/translation.json';
import translationFR from '@/locales/fr/translation.json';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_APP_LANG,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
