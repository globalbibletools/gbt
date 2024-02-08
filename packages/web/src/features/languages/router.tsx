import { RouteObject } from 'react-router-dom';
import { authorize } from '../../shared/accessControl';
import ImportLanguageGlossesView, {
  importLanguageGlossesLoader,
} from './ImportLanguageGlossesView';
import InviteLanguageMemberView from './InviteLanguageMemberView';
import LanguagesView, { languagesViewLoader } from './LanguagesView';
import ManageLanguageView, {
  manageLanguageViewLoader,
} from './ManageLanguageView';
import NewLanguageView from './NewLanguageView';

const routes: RouteObject[] = [
  {
    path: 'languages',
    loader: () => authorize('administer', 'Language', languagesViewLoader),
    element: <LanguagesView />,
  },
  {
    path: 'languages/new',
    loader: () => authorize('create', 'Language'),
    element: <NewLanguageView />,
  },
  {
    path: 'languages/:code',
    loader: ({ params }) => {
      const code = params.code as string;
      return authorize('administer', { type: 'Language', id: code }, () =>
        manageLanguageViewLoader(code)
      );
    },
    element: <ManageLanguageView />,
  },
  {
    path: 'languages/:code/invite',
    loader: ({ params }) =>
      authorize('administer', { type: 'Language', id: params.code as string }),
    element: <InviteLanguageMemberView />,
  },
  {
    path: 'languages/:code/import',
    loader: (options) => {
      return authorize(
        'administer',
        {
          type: 'Language',
          id: options.params.code as string,
        },
        () => importLanguageGlossesLoader(options)
      );
    },
    element: <ImportLanguageGlossesView />,
  },
];

export default routes;
