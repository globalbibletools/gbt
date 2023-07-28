import { RouteObject } from 'react-router-dom';
import InviteLanguageMemberView from './InviteLanguageMemberView';
import LanguageView, { languagesViewLoader } from './LanguagesView';
import ManageLanguageView, {
  manageLanguageViewLoader,
} from './ManageLanguageView';
import NewLanguageView from './NewLanguageView';
import { QueryClient } from '@tanstack/react-query';

export default (queryClient: QueryClient): RouteObject[] => [
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
    loader: manageLanguageViewLoader(queryClient),
    element: <ManageLanguageView />,
  },
  {
    path: 'languages/:code/invite',
    element: <InviteLanguageMemberView />,
  },
];
