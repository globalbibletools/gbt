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
import { GetUsersResponseBody, SystemRole } from '@translation/api-types';
import { capitalize } from '../../shared/utils';
import { useFlash } from '../../shared/hooks/flash';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccessControl } from '../../shared/accessControl';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import useTitle from '../../shared/hooks/useTitle';

export default function UsersView() {
  const { t } = useTranslation(['users']);
  useTitle(t('common:tab_titles.users'));
  const flash = useFlash();

  const userCan = useAccessControl();

  const usersQuery = useQuery(['users'], () => apiClient.users.findAll());
  const queryClient = useQueryClient();
  const userMutation = useMutation({
    mutationFn: (variables: { id: string; systemRoles: SystemRole[] }) =>
      apiClient.users.update(variables),
    onMutate: async ({ id, systemRoles }) => {
      const queryKey = ['users'];
      await queryClient.cancelQueries({ queryKey });
      const previousUsers = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<GetUsersResponseBody>(queryKey, (old) => {
        if (old) {
          const users = old.data.slice();
          const index = users.findIndex((u) => u.id === id);
          if (index >= 0) {
            const doc = users[index];
            users.splice(index, 1, {
              ...doc,
              systemRoles: systemRoles,
            });
            return {
              data: users,
            };
          }
        }
        return old;
      });
      return { previousUsers };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['users'], context?.previousUsers);

      alert('Unknown error occurred.');
    },
    onSuccess() {
      flash.success(t('users:user_role_changed'));
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{capitalize(t('users:users', { count: 100 }))}</ViewTitle>
        <List>
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:name', { count: 1 }).toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:email').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[60px]">
              {t('users:email_status').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[80px]">
              {t('users:role', { count: 100 }).toUpperCase()}
            </ListHeaderCell>
          </ListHeader>
          {userCan('create', 'User') && (
            <ListRowAction colSpan={4}>
              <Link to="./invite">
                <Icon icon="plus" className="mr-1" />
                {t('users:invite_user')}
              </Link>
            </ListRowAction>
          )}
          <ListBody>
            {usersQuery.data?.data.map((user) => (
              <ListRow key={user.id}>
                <ListCell header>{user.name}</ListCell>
                <ListCell>{user.email}</ListCell>
                <ListCell>
                  {user.emailStatus &&
                    t('users:email_status', {
                      context: user.emailStatus.toLowerCase(),
                    })}
                </ListCell>
                <ListCell>
                  <ComboboxInput
                    className="w-42"
                    autoComplete="off"
                    value={user.systemRoles?.[0] ?? ''}
                    aria-label={t('users:role') ?? ''}
                    onChange={(role) =>
                      userMutation.mutate({
                        id: user.id,
                        systemRoles: role ? [role as SystemRole] : [],
                      })
                    }
                    items={[
                      { label: '', value: '' },
                      { label: t('users:role_admin'), value: SystemRole.Admin },
                    ]}
                  />
                </ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
      </div>
    </View>
  );
}
