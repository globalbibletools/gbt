import { redirect, RouteObject } from 'react-router-dom';
import { authorize } from '../../shared/accessControl';
import TranslationView from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate/:verseId?',
    loader: async ({ params }) => {
      if (!params.verseId) {
        return redirect('/translate/01001001');
      }
      const code = JSON.parse(
        localStorage.getItem('translation-language') ?? 'en'
      );
      await authorize('translate', { type: 'Language', id: code });
    },
    element: <TranslationView />,
  },
];

export default routes;
