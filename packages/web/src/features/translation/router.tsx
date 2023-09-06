import { RouteObject, redirect } from 'react-router-dom';
import TranslationView, {
  translationLanguageKey,
  translationVerseIdKey,
} from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate',
    loader() {
      const language = localStorage.getItem(translationLanguageKey) ?? 'en';
      const verseId = localStorage.getItem(translationVerseIdKey) ?? '01001001';
      return redirect(`/languages/${language}/verses/${verseId}`);
    },
  },
  {
    path: 'languages/:language/verses/:verseId?',
    element: <TranslationView />,
  },
];

export default routes;
