import { RouteObject } from 'react-router-dom';
import LanguageView from './LanguageView';
import ManageLanguageView, {
  manageLanguageViewLoader,
} from './ManageLanguageView';
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
  {
    path: 'languages/:code',
    loader: manageLanguageViewLoader,
    element: <ManageLanguageView />,
  },
];

export default routes;
