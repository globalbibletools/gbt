import { RouteObject } from 'react-router-dom';
import LanguageView from './LanguageView';
import NewLanguageView from './NewLanguageView';

const routes: RouteObject[] = [
  {
    path: 'languages',
    element: <LanguageView />,
  },
  {
    path: 'languages/new',
    element: <NewLanguageView />,
  },
];

export default routes;
