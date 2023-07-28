import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { LoaderFunctionArgs, useLoaderData, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { SystemRole } from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { useFlash } from '../../shared/hooks/flash';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import useAuth from '../../shared/hooks/useAuth';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
  ListRowAction,
} from '../../shared/components/List';
import { Link } from '../../shared/components/actions/Link';
import { Icon } from '../../shared/components/Icon';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const languageQueryKey = (code: string) => ({
  queryKey: ['language', code],
  queryFn: () => apiClient.languages.findByCode(code),
});
const languageMembersQueryKey = (code: string) => ({
  queryKey: ['language-members', code],
  queryFn: () => apiClient.languages.findMembers(code),
});

export const manageLanguageViewLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const code = params.code ?? 'unknown';
    const language = await queryClient.ensureQueryData(languageQueryKey(code));
    const members = await queryClient.ensureQueryData(
      languageMembersQueryKey(code)
    );
    return { language, members };
  };

function useRemoveLanguageMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { userId: string; code: string }) =>
      apiClient.languages.removeMember(variables.code, variables.userId),
    onSettled: (_, __, { code }, context) => {
      queryClient.invalidateQueries({
        queryKey: languageMembersQueryKey(code).queryKey,
      });
    },
  });
}

function useLicenseQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof manageLanguageViewLoader>>
  >;
  return useQuery({
    ...languageQueryKey(code),
    initialData: loaderData.language,
  });
}

function useLicenseMembersQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof manageLanguageViewLoader>>
  >;
  return useQuery({
    ...languageMembersQueryKey(code),
    initialData: loaderData.members,
  });
}

interface FormData {
  name: string;
}

export default function ManageLanguageView() {
  const params = useParams() as { code: string };

  useAuth({ requireRole: [SystemRole.Admin] });
  const flash = useFlash();

  const { data: language } = useLicenseQuery(params.code);
  const { data: members } = useLicenseMembersQuery(params.code);

  const { t } = useTranslation(['translation', 'users']);

  const removeMemberMutation = useRemoveLanguageMemberMutation();

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.update(language.data.code, {
        name: data.name,
      });
      flash.success(t('translation:language_updated'));
    } catch (error) {
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <div className="mx-4 flex-shrink">
        <ViewTitle className="flex">
          <span>{language.data.name}</span>
          <span className="mx-2">-</span>
          <span>{language.data.code}</span>
        </ViewTitle>
        <Form context={formContext} onSubmit={onSubmit} className="mb-8">
          <div className="mb-2">
            <FormLabel htmlFor="name">
              {t('translation:name').toUpperCase()}
            </FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              defaultValue={language.data.name}
              required
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('translation:language_name_required') }}
            />
          </div>
          <div>
            <Button type="submit">{t('translation:update')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
        <List>
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:name').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:email').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:roles').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell />
          </ListHeader>
          <ListRowAction colSpan={4}>
            <Link to="./invite">
              <Icon icon="plus" className="me-1" />
              {t('users:invite_user')}
            </Link>
          </ListRowAction>
          <ListBody>
            {members.data.map((member) => (
              <ListRow key={member.userId}>
                <ListCell header>{member.name}</ListCell>
                <ListCell>{member.email}</ListCell>
                <ListCell>
                  {member.roles
                    .map((role) =>
                      t('users:role', { context: role.toLowerCase() })
                    )
                    .join(', ')}
                </ListCell>
                <ListCell>
                  <Button
                    onClick={() =>
                      removeMemberMutation.mutate({
                        userId: member.userId,
                        code: params.code,
                      })
                    }
                  >
                    Remove
                  </Button>
                </ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
      </div>
    </View>
  );
}
