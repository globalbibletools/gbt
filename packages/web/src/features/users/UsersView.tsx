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
import useSession from '../../shared/hooks/useSession';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SelectInput from '../../shared/components/form/SelectInput';

export default function UsersView() {
  const session = useSession();

  const { t } = useTranslation();

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
            {usersQuery.data?.data.map((user) => (
              <ListRow key={user.id}>
                <ListCell header>{user.name}</ListCell>
                <ListCell>{user.email}</ListCell>
                <ListCell>
                  <SelectInput
                    className="w-32"
                    name="userRole"
                    value={user.systemRoles[0] ?? ''}
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
                    <option value={SystemRole.Admin}>Admin</option>
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
