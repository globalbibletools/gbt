import { RouteObject } from 'react-router-dom';
import TranslationView, { translationViewLoader } from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate/:verseId',
    element: <TranslationView />,
    loader: translationViewLoader,
  },
];

export default routes;
