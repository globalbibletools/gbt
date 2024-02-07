import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LanguageRole, TextDirection } from '@translation/api-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import bibleTranslationClient, {
  BibleTranslation,
} from '../../shared/bibleTranslationClient';
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
import Button from '../../shared/components/actions/Button';
import { Link } from '../../shared/components/actions/Link';
import {
  ButtonSelectorInput,
  ButtonSelectorOption,
} from '../../shared/components/form/ButtonSelectorInput';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import SortableMultiselectInput from '../../shared/components/form/SortableMultiselectInput';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import TextInput from '../../shared/components/form/TextInput';
import fontClient from '../../shared/fontClient';
import { useFlash } from '../../shared/hooks/flash';
import queryClient from '../../shared/queryClient';
import useTitle from '../../shared/hooks/useTitle';

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
  const translations = await bibleTranslationClient.getOptions(code);
  return { language, members, fonts, translations };
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

function useLanguageQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageViewLoader>
  >;
  return useQuery({
    ...languageQueryKey(code),
    initialData: loaderData.language,
  });
}

function useLanguageMembersQuery(code: string) {
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
  font: string;
  textDirection: TextDirection;
  bibleTranslationIds: string[];
}

export default function ManageLanguageView() {
  const params = useParams() as { code: string };
  const flash = useFlash();

  const { data: language } = useLanguageQuery(params.code);
  useTitle(`Manage ${language.data.name}`);

  const { data: members } = useLanguageMembersQuery(params.code);
  const { fonts, translations } = useLoaderData() as {
    fonts: string[];
    translations: BibleTranslation[];
  };
  const translationOptions = translations.map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  const { t } = useTranslation(['common', 'languages', 'users']);

  const removeMemberMutation = useRemoveLanguageMemberMutation();
  const updateMemberMutation = useUpdateLanguageMemberMutation();

  const formContext = useForm<FormData>({
    defaultValues: {
      name: language.data.name,
      font: language.data.font,
      textDirection: language.data.textDirection,
      bibleTranslationIds: language.data.bibleTranslationIds,
    },
  });
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.update(language.data.code, {
        name: data.name,
        font: data.font,
        textDirection: data.textDirection,
        bibleTranslationIds: data.bibleTranslationIds,
      });
      flash.success(t('languages:language_updated'));
    } catch (error) {
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex items-start justify-center">
      <div className="flex-shrink mx-4">
        <ViewTitle className="flex">
          <span>{language.data.name}</span>
          <span className="mx-2">-</span>
          <span>{language.data.code}</span>
        </ViewTitle>
        <Form context={formContext} onSubmit={onSubmit} className="mb-8">
          <div className="mb-2">
            <FormLabel htmlFor="name">
              {t('common:name').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('name', {
                required: true,
              })}
              id="name"
              className="w-full"
              autoComplete="off"
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('languages:language_name_required') }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="font">
              {t('languages:font').toUpperCase()}
            </FormLabel>
            <Controller
              name="font"
              rules={{ required: true }}
              render={({ field }) => (
                <ComboboxInput
                  {...field}
                  id="font"
                  className="w-full h-10"
                  items={fonts.map((font) => ({ label: font, value: font }))}
                />
              )}
            />
          </div>
          <div className="mb-2">
            <FormLabel id="text-direction-label">
              {t('languages:text_direction').toUpperCase()}
            </FormLabel>
            <div>
              <Controller
                name="textDirection"
                rules={{ required: true }}
                render={({ field }) => (
                  <ButtonSelectorInput
                    {...field}
                    aria-labelledby="text-direction-label"
                  >
                    <ButtonSelectorOption value={TextDirection.LTR}>
                      {t('languages:ltr')}
                    </ButtonSelectorOption>
                    <ButtonSelectorOption value={TextDirection.RTL}>
                      {t('languages:rtl')}
                    </ButtonSelectorOption>
                  </ButtonSelectorInput>
                )}
              />
            </div>
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="bibleTranslationIds">
              {t('languages:bible_translations').toUpperCase()}
            </FormLabel>
            <Controller
              name="bibleTranslationIds"
              render={({ field }) => (
                <SortableMultiselectInput
                  {...field}
                  className="w-full"
                  items={translationOptions}
                  placeholder={t('languages:select_translations').toString()}
                />
              )}
            />
          </div>
          <div>
            <Button type="submit">{t('common:update')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
        <List className="mb-8">
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('common:name').toUpperCase()}
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
            {t('languages:import_glosses')}
          </Link>
        </div>
      </div>
    </View>
  );
}
