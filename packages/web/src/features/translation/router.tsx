import { redirect, RouteObject } from 'react-router-dom';
import TranslationView from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate/:verseId?',
    loader: ({ params }) => {
      if (!params.verseId) {
        return redirect('/translate/01001001');
      }
      return null;
    },
    element: <TranslationView />,
  },
];

export default routes;
