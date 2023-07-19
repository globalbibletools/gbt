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
import SelectInput from '../../shared/components/form/SelectInput';
import { UserCan } from '../../shared/accessControl';

export default function UsersView() {
  const { t } = useTranslation('users');
  const flash = useFlash();

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
      flash.success(t('user_role_changed'));
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
        <ViewTitle>{capitalize(t('users', { count: 100 }))}</ViewTitle>
        <List>
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('name', { count: 1 }).toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('email').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[60px]">
              {t('email_status').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[80px]">
              {t('role', { count: 100 }).toUpperCase()}
            </ListHeaderCell>
          </ListHeader>
          <UserCan action="create" subject="User">
            <ListRowAction colSpan={4}>
              <Link to="./invite">
                <Icon icon="plus" className="mr-1" />
                {t('invite_user')}
              </Link>
            </ListRowAction>
          </UserCan>
          <ListBody>
            {usersQuery.data?.data.map((user) => (
              <ListRow key={user.id}>
                <ListCell header>{user.name}</ListCell>
                <ListCell>{user.email}</ListCell>
                <ListCell>
                  {user.emailStatus &&
                    t('email_status', {
                      context: user.emailStatus.toLowerCase(),
                    })}
                </ListCell>
                <ListCell>
                  <SelectInput
                    className="w-42"
                    name="userRole"
                    value={user.systemRoles?.[0] ?? ''}
                    aria-label={t('role') ?? ''}
                    onChange={(e) =>
                      userMutation.mutate({
                        id: user.id,
                        systemRoles: e.currentTarget.value
                          ? [e.currentTarget.value as SystemRole]
                          : [],
                      })
                    }
                  >
                    <option></option>
                    <option value={SystemRole.Admin}>{t('role_admin')}</option>
                  </SelectInput>
                </ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
      </div>
    </View>
  );
}
