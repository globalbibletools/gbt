import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
} from '../../shared/components/List';
import ViewTitle from '../../shared/components/ViewTitle';
import { GetUsersResponseBody, SystemRole } from '@translation/api-types';
import { capitalize } from '../../shared/utils';
import { useFlash } from '../../shared/hooks/flash';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccessControl } from '../../shared/accessControl';
import useTitle from '../../shared/hooks/useTitle';
import Button from '../../shared/components/actions/Button';
import { useRef } from 'react';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import InviteUserDialog, { InviteUserDialogRef } from './InviteUserDialog';

export default function UsersView() {
  const { t } = useTranslation(['users', 'common']);
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

  const inviteDialog = useRef<InviteUserDialogRef>(null);

  return (
    <div className="px-8 py-6 w-fit">
      <div className="flex items-baseline mb-4">
        <ViewTitle>{capitalize(t('users:users', { count: 100 }))}</ViewTitle>
        <div className="flex-grow" />
        {userCan('create', 'User') && (
          <Button
            onClick={() => inviteDialog.current?.showModal()}
            variant="primary"
          >
            <Icon icon="plus" className="mr-1" />
            {t('users:invite_user')}
          </Button>
        )}
      </div>
      <InviteUserDialog ref={inviteDialog} />
      <List>
        <ListHeader>
          <ListHeaderCell className="min-w-[120px]">
            {t('users:name', { count: 1 }).toUpperCase()}
          </ListHeaderCell>
          <ListHeaderCell className="min-w-[120px]">
            {t('users:email').toUpperCase()}
          </ListHeaderCell>
          <ListHeaderCell className="min-w-[80px]">
            {t('users:role', { count: 100 }).toUpperCase()}
          </ListHeaderCell>
        </ListHeader>
        <ListBody>
          {usersQuery.data?.data.map((user) => (
            <ListRow key={user.id}>
              <ListCell header>{user.name}</ListCell>
              <ListCell>
                {user.email}
                {user.emailStatus !== 'VERIFIED' && (
                  <div className="ml-2 inline-block text-sm px-2 rounded bg-red-700 text-white">
                    <Icon icon="exclamation-triangle" className="mr-1" />
                    {t('users:email_status', {
                      context: user.emailStatus?.toLowerCase() ?? 'unverified',
                    })}
                  </div>
                )}
              </ListCell>
              <ListCell>
                <MultiselectInput
                  className="w-42"
                  value={user.systemRoles ?? []}
                  aria-label={t('users:role') ?? ''}
                  onChange={(systemRoles: SystemRole[]) =>
                    userMutation.mutate({
                      id: user.id,
                      systemRoles: systemRoles,
                    })
                  }
                  items={[
                    { label: t('users:role_admin'), value: SystemRole.Admin },
                  ]}
                />
              </ListCell>
            </ListRow>
          ))}
        </ListBody>
      </List>
    </div>
  );
}
