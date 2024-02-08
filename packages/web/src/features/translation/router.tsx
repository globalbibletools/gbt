import { RouteObject, redirect } from 'react-router-dom';
import TranslationView, {
  translationLanguageKey,
  translationVerseIdKey,
  translationViewLoader,
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
    loader: ({ params }) => translationViewLoader(params.language ?? ''),
    element: <TranslationView />,
  },
];

export default routes;
