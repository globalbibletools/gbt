import { useLoaderData, useParams } from 'react-router-dom';
import { useAccessControl } from '../../shared/accessControl';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
} from '../../shared/components/List';
import ViewTitle from '../../shared/components/ViewTitle';
import Button from '../../shared/components/actions/Button';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import queryClient from '../../shared/queryClient';
import { useTranslation } from 'react-i18next';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import { GetSessionResponse, LanguageRole } from '@translation/api-types';
import { capitalize } from 'lodash';
import { Icon } from '../../shared/components/Icon';
import InviteLanguageMemberDialog, {
  InviteLanguageMemberDialogRef,
} from './InviteLanguageMemberDialog';
import { useRef } from 'react';

const languageMembersQueryKey = (code: string) => ({
  queryKey: ['language-members', code],
  queryFn: () => apiClient.languages.findMembers(code),
});

export const manageLanguageUsersViewLoader = async (code: string) => {
  return queryClient.ensureQueryData(languageMembersQueryKey(code));
};

function useLanguageMembersQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageUsersViewLoader>
  >;
  return useQuery({
    ...languageMembersQueryKey(code),
    initialData: loaderData,
  });
}

function useUpdateLanguageMemberMutation() {
  return useMutation({
    mutationFn: (variables: {
      userId: string;
      code: string;
      roles: LanguageRole[];
    }) =>
      apiClient.languages.updateMember(
        variables.code,
        variables.userId,
        variables.roles
      ),
    onSettled: (_, __, { code, userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: languageMembersQueryKey(code).queryKey,
      });
      const session: GetSessionResponse | undefined = queryClient.getQueryData([
        'session',
      ]);
      if (!session || session.user?.id === userId)
        queryClient.invalidateQueries(['session']);
    },
  });
}

function useRemoveLanguageMemberMutation() {
  return useMutation({
    mutationFn: (variables: { userId: string; code: string }) =>
      apiClient.languages.removeMember(variables.code, variables.userId),
    onSettled: (_, __, { code, userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: languageMembersQueryKey(code).queryKey,
      });
      const session: GetSessionResponse | undefined = queryClient.getQueryData([
        'session',
      ]);
      if (!session || session.user?.id === userId)
        queryClient.invalidateQueries(['session']);
    },
  });
}

export default function ManageLanguageUserView() {
  const params = useParams() as { code: string };

  const { t } = useTranslation(['users', 'common']);
  const userCan = useAccessControl();

  const { data: members } = useLanguageMembersQuery(params.code);

  const removeMemberMutation = useRemoveLanguageMemberMutation();
  const updateMemberMutation = useUpdateLanguageMemberMutation();

  const inviteDialog = useRef<InviteLanguageMemberDialogRef>(null);

  return (
    <div className="px-8 py-6 w-fit">
      <div className="flex items-baseline mb-4">
        <ViewTitle>
          {capitalize(t('users:users', { count: 100 }) ?? '')}
        </ViewTitle>
        <div className="flex-grow" />
        {userCan('administer', 'Language') && (
          <Button
            onClick={() => inviteDialog.current?.showModal()}
            variant="primary"
          >
            <Icon icon="plus" className="me-1" />
            {t('users:invite_user')}
          </Button>
        )}
      </div>
      <InviteLanguageMemberDialog
        ref={inviteDialog}
        languageCode={params.code}
      />
      <List>
        <ListHeader>
          <ListHeaderCell className="min-w-[120px]">
            {t('users:name', { count: 1 }).toUpperCase()}
          </ListHeaderCell>
          <ListHeaderCell className="min-w-[80px] ps-4">
            {t('users:role', { count: 100 }).toUpperCase()}
          </ListHeaderCell>
          <ListHeaderCell />
        </ListHeader>
        <ListBody>
          {members?.data.map((user) => (
            <ListRow key={user.userId}>
              <ListCell header className="pe-4 py-2">
                <div className="">{user.name}</div>
                <div className="font-normal text-sm">{user.email}</div>
              </ListCell>
              <ListCell className="ps-4 py-2">
                <MultiselectInput
                  className="w-full"
                  name="roles"
                  value={user.roles}
                  items={[
                    {
                      label: t('users:role_admin'),
                      value: LanguageRole.Admin,
                    },
                    {
                      label: t('users:role_translator'),
                      value: LanguageRole.Translator,
                    },
                  ]}
                  onChange={(roles) =>
                    updateMemberMutation.mutate({
                      code: params.code,
                      userId: user.userId,
                      roles: roles as LanguageRole[],
                    })
                  }
                />
              </ListCell>
              <ListCell className="py-2">
                <Button
                  variant="tertiary"
                  className="text-red-700 ms-2 -me-2"
                  destructive
                  onClick={() =>
                    removeMemberMutation.mutate({
                      userId: user.userId,
                      code: params.code,
                    })
                  }
                >
                  <Icon icon="xmark" />
                  <span className="sr-only">Remove</span>
                </Button>
              </ListCell>
            </ListRow>
          ))}
        </ListBody>
      </List>
    </div>
  );
}
