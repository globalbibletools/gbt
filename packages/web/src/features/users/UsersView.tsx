import { useTranslation } from 'react-i18next';
import { Link } from '../../shared/components/actions/Link';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
  ListRowAction,
} from '../../shared/components/List';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useLoaderData } from 'react-router-dom';
import { GetUsersResponseBody, SystemRole } from '@translation/api-types';
import { capitalize } from '../../shared/utils';
import useSession from '../../shared/hooks/useSession';

export function usersViewLoader() {
  return apiClient.users.findAll();
}

export default function UsersView() {
  const session = useSession();
  const users = useLoaderData() as GetUsersResponseBody;

  const { t } = useTranslation();

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{capitalize(t('users', { count: 100 }))}</ViewTitle>
        <List>
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('name', { count: 1 }).toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('email').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[80px]">
              {t('roles').toUpperCase()}
            </ListHeaderCell>
          </ListHeader>
          {session.user?.systemRoles.includes(SystemRole.Admin) && (
            <ListRowAction colSpan={3}>
              <Link to="./invite">
                <Icon icon="plus" className="mr-1" />
                {t('invite_user')}
              </Link>
            </ListRowAction>
          )}
          <ListBody>
            {users.data.map((user) => (
              <ListRow key={user.id}>
                <ListCell header>{user.name}</ListCell>
                <ListCell>{user.email}</ListCell>
                <ListCell>
                  {user.systemRoles.map((role) => role.toLowerCase())}
                </ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
      </div>
    </View>
  );
}
