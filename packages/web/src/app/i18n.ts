import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Check if the user has selected a language yet.
// If they haven't, they will be presented with the language dialog
// See footer.tsx
export const initialLanguageChosen = !!localStorage.getItem('i18nextLng');

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    returnObjects: true,
    ns: ['bible', 'translation', 'users'],
    defaultNS: false,
    fallbackNS: false,
  });

export default i18n;
