import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useLoaderData, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LanguageRole } from '@translation/api-types';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { useTranslation } from 'react-i18next';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { useFlash } from '../../shared/hooks/flash';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import queryClient from '../../shared/queryClient';
import fontClient from '../../shared/fontClient';

const languageQueryKey = (code: string) => ({
  queryKey: ['language', code],
  queryFn: () => apiClient.languages.findByCode(code),
});
const languageMembersQueryKey = (code: string) => ({
  queryKey: ['language-members', code],
  queryFn: () => apiClient.languages.findMembers(code),
});

export const manageLanguageViewLoader = async (code: string) => {
  const language = await queryClient.ensureQueryData(languageQueryKey(code));
  const members = await queryClient.ensureQueryData(
    languageMembersQueryKey(code)
  );
  const fonts = await fontClient.getFonts();
  return { language, members, fonts };
};

function useUpdateLanguageMemberMutation() {
  const queryClient = useQueryClient();
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
    onSettled: (_, __, { code }, context) => {
      queryClient.invalidateQueries({
        queryKey: languageMembersQueryKey(code).queryKey,
      });
    },
  });
}

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
    ReturnType<typeof manageLanguageViewLoader>
  >;
  return useQuery({
    ...languageQueryKey(code),
    initialData: loaderData.language,
  });
}

function useLicenseMembersQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageViewLoader>
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
  const flash = useFlash();

  const { data: language } = useLicenseQuery(params.code);
  const { data: members } = useLicenseMembersQuery(params.code);
  const { fonts } = useLoaderData() as { fonts: unknown };
  console.log('FONTS:', fonts);

  const { t } = useTranslation(['translation', 'users']);

  const removeMemberMutation = useRemoveLanguageMemberMutation();
  const updateMemberMutation = useUpdateLanguageMemberMutation();

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
        <List className="mb-8">
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
                  <MultiselectInput
                    className="w-full"
                    name="roles"
                    value={member.roles}
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
                        userId: member.userId,
                        roles: roles as LanguageRole[],
                      })
                    }
                  />
                </ListCell>
                <ListCell>
                  <Button
                    variant="tertiary"
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
        <div>
          <Link to="./import" variant="button">
            <Icon icon="file-import" className="me-4"></Icon>
            {t('import_glosses')}
          </Link>
        </div>
      </div>
    </View>
  );
}
