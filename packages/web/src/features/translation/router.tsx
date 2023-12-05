import { RouteObject, redirect } from 'react-router-dom';
import TranslationView, {
  translationLanguageKey,
  translationVerseIdKey,
} from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'interlinear',
    loader() {
      const language = localStorage.getItem(translationLanguageKey) ?? 'eng';
      const verseId = localStorage.getItem(translationVerseIdKey) ?? '01001001';
      return redirect(`/interlinear/${language}/verses/${verseId}`);
    },
  },
  {
    path: 'interlinear/:language/verses/:verseId?',
    element: <TranslationView />,
  },
];

export default routes;
