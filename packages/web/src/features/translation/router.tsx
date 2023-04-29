import { RouteObject } from 'react-router-dom';
import TranslationView from './TranslationView';

const routes: RouteObject[] = [
  {
    path: 'translate/:verseId',
    element: <TranslationView />,
  },
];

export default routes;
