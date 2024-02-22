import { NavLink, Outlet, useLoaderData, useParams } from 'react-router-dom';
import { Icon } from '../../shared/components/Icon';
import apiClient from '../../shared/apiClient';
import queryClient from '../../shared/queryClient';
import { useQuery } from '@tanstack/react-query';

const languageQueryKey = (code: string) => ({
  queryKey: ['language', code],
  queryFn: () => apiClient.languages.findByCode(code),
});

export const manageLanguageViewLoader = async (code: string) => {
  return queryClient.ensureQueryData(languageQueryKey(code));
};

function useLanguageQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageViewLoader>
  >;
  return useQuery({
    ...languageQueryKey(code),
    initialData: loaderData,
  });
}

export default function ManageLanguageView() {
  const params = useParams() as { code: string };

  const { data: language } = useLanguageQuery(params.code);

  return (
    <div className="absolute w-full h-full flex items-stretch">
      <div className="w-56 flex-shrink-0 bg-brown-100 p-6 pt-7">
        <div className="px-3 mb-4">
          <h2 className="font-bold text-lg">{language.data.name}</h2>
        </div>
        <ul>
          <li>
            <NavLink
              to={`/admin/languages/${params.code}/settings`}
              className={({ isActive }) =>
                `block px-3 py-1 rounded-lg text-blue-800 font-bold mb-2 ${
                  isActive ? 'bg-green-200 ' : ''
                }`
              }
            >
              <Icon icon="sliders" className="w-4 me-2" />
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/languages/${params.code}/users`}
              className={({ isActive }) =>
                `block px-3 py-1 rounded-lg text-blue-800 font-bold mb-2 ${
                  isActive ? 'bg-green-200 ' : ''
                }`
              }
            >
              <Icon icon="user" className="w-4 me-2" />
              Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/languages/${params.code}/import`}
              className={({ isActive }) =>
                `block px-3 py-1 rounded-lg text-blue-800 font-bold mb-2 ${
                  isActive ? 'bg-green-200 ' : ''
                }`
              }
            >
              <Icon icon="file-import" className="w-4 me-2" />
              Import
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
