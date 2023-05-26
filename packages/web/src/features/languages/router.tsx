import { RouteObject } from 'react-router-dom';
import LanguageView, { languagesViewLoader } from './LanguagesView';
import ManageLanguageView, {
  manageLanguageViewLoader,
} from './ManageLanguageView';
import NewLanguageView from './NewLanguageView';

const routes: RouteObject[] = [
  {
    path: 'languages',
    loader: languagesViewLoader,
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
