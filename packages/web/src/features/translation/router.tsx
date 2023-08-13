import { RouteObject, redirect } from 'react-router-dom';
import TranslationView from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate',
    loader() {
      const language = localStorage.getItem('translation-language') ?? 'en';
      return redirect(`/languages/${language}/verses/01001001`);
    },
  },
  {
    path: 'languages/:language/verses/:verseId?',
    element: <TranslationView />,
  },
];

export default routes;
