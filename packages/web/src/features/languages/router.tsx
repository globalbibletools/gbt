import { RouteObject, redirect } from 'react-router-dom';
import { authorize } from '../../shared/accessControl';
import LanguagesView, { languagesViewLoader } from './LanguagesView';
import ManageLanguageView, {
  manageLanguageViewLoader,
} from './ManageLanguageView';
import ManageLanguageUserView, {
  manageLanguageUsersViewLoader,
} from './ManageLanguageUsersView';
import ManageLanguageImportView, {
  manageLanguageImportViewLoader,
} from './ManageLanguageImportView';
import ManageLanguageSettingsView, {
  manageLanguageSettingsViewLoader,
} from './ManageLanguageSettingsView';
import ManageLanguageReportsView from './ManageLanguageReportsView';

export const languageAdminRoutes: RouteObject[] = [
  {
    path: 'languages',
    loader: () => authorize('administer', 'Language', languagesViewLoader),
    element: <LanguagesView />,
  },
];

const PATH_MATCH = /(settings|users|import)$/;
export const languagePageRoutes: RouteObject[] = [
  {
    path: 'admin?/languages/:code',
    loader: ({ params, request }) => {
      const code = params.code as string;
      return authorize(
        'administer',
        { type: 'Language', id: code },
        async () => {
          const url = new URL(request.url);
          if (!PATH_MATCH.test(url.pathname)) {
            return redirect('./settings');
          } else {
            return manageLanguageViewLoader(code);
          }
        }
      );
    },
    element: <ManageLanguageView />,
    children: [
      {
        path: 'settings',
        element: <ManageLanguageSettingsView />,
        loader: ({ params }) =>
          manageLanguageSettingsViewLoader(params.code as string),
      },
      {
        path: 'users',
        element: <ManageLanguageUserView />,
        loader: ({ params }) =>
          manageLanguageUsersViewLoader(params.code as string),
      },
      {
        path: 'reports',
        element: <ManageLanguageReportsView />,
      },
      {
        path: 'import',
        element: <ManageLanguageImportView />,
        loader: manageLanguageImportViewLoader,
      },
    ],
  },
];
