import { debounce } from 'lodash';
import ViewTitle from '../../shared/components/ViewTitle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import queryClient from '../../shared/queryClient';
import fontClient from '../../shared/fontClient';
import bibleTranslationClient, {
  BibleTranslation,
} from '../../shared/bibleTranslationClient';
import { useLoaderData, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  PatchLanguageRequestBody,
  TextDirection,
} from '@translation/api-types';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import { Controller, useForm } from 'react-hook-form';
import {
  ButtonSelectorInput,
  ButtonSelectorOption,
} from '../../shared/components/form/ButtonSelectorInput';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import SortableMultiselectInput from '../../shared/components/form/SortableMultiselectInput';
import { Icon } from '../../shared/components/Icon';
import { useFlash } from '../../shared/hooks/flash';
import Link from '../../shared/components/actions/Link';
import { useCallback, useMemo } from 'react';

const languageQueryKey = (code: string) => ({
  queryKey: ['language', code],
  queryFn: () => apiClient.languages.findByCode(code),
});

export const manageLanguageSettingsViewLoader = async (code: string) => {
  const language = await queryClient.ensureQueryData(languageQueryKey(code));
  const fonts = await fontClient.getFonts();
  const translations = await bibleTranslationClient.getOptions(code);
  return { language, fonts, translations };
};

function useLanguageQuery(code: string) {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageSettingsViewLoader>
  >;
  return useQuery({
    ...languageQueryKey(code),
    initialData: loaderData.language,
  });
}

function useLanguageMutation() {
  return useMutation({
    mutationFn: ({
      code,
      ...fields
    }: PatchLanguageRequestBody & { code: string }) =>
      apiClient.languages.update(code, fields),
    onSettled: (_, __, { code }, context) => {
      queryClient.invalidateQueries(['language', code]);
    },
  });
}

interface FormData {
  name: string;
  font: string;
  textDirection: TextDirection;
  bibleTranslationIds: string[];
}

export default function ManageLanguageSettingsView() {
  const params = useParams() as { code: string };
  const { t } = useTranslation(['languages', 'common']);

  const { data: language } = useLanguageQuery(params.code);
  const { fonts, translations } = useLoaderData() as {
    fonts: string[];
    translations: BibleTranslation[];
  };
  const translationOptions = translations.map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  const formContext = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: language.data.name,
      font: language.data.font,
      textDirection: language.data.textDirection,
      bibleTranslationIds: language.data.bibleTranslationIds,
    },
  });

  const flash = useFlash();

  const { mutate: updateLanguage, isLoading } = useLanguageMutation();

  const tryAutosave = useCallback(
    async (field: keyof FormData) => {
      try {
        if (
          formContext.getValues(field) === language.data[field] ||
          !(await formContext.trigger(field))
        ) {
          return;
        }

        updateLanguage({
          code: language.data.code,
          [field]: formContext.getValues(field),
        });
      } catch (error) {
        flash.error(`${error}`);
      }
    },
    [formContext, flash, language.data, updateLanguage]
  );

  const tryAutosaveName = useMemo(
    () => debounce(() => tryAutosave('name'), 2000),
    [tryAutosave]
  );

  return (
    <div className="px-8 py-6 w-fit overflow-y-auto h-full">
      <div className="flex items-baseline mb-4">
        <ViewTitle>Settings</ViewTitle>
        <div className="ms-6 text-gray-700">
          {isLoading ? (
            <>
              <Icon icon="arrows-rotate" className="me-1" />
              {t('common:saving')}
            </>
          ) : (
            <>
              <Icon icon="check" className="me-1" />
              {t('common:saved')}
            </>
          )}
        </div>
      </div>
      <Form context={formContext} className="max-w-[1000px]">
        <section className="flex flex-col gap-4 lg:flex-row lg:gap-20 pb-8 px-10 border-b border-b-green-300">
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-2">Identification</h3>
            <p className="text-sm mb-2">
              The name of the language is shown throughout the app. We prefer it
              to be written in the language rather than English.
            </p>
            <p className="text-sm">
              The language code follows{' '}
              <Link
                to="https://en.wikipedia.org/wiki/ISO_639-3"
                target="_blank"
                rel="noopener"
              >
                ISO 639-3
                <Icon icon="external-link" className="ms-1" />
              </Link>{' '}
              which uniquely identifies languages across systems.
            </p>
          </div>
          <div className="flex-shrink-0 w-80">
            <div className="mb-4">
              <FormLabel htmlFor="language-name">
                {t('common:name').toUpperCase()}
              </FormLabel>
              <TextInput
                {...formContext.register('name', {
                  required: true,
                  onChange: () => tryAutosaveName(),
                  onBlur: () => tryAutosaveName.flush(),
                })}
                id="language-name"
                className="block w-56"
                autoComplete="off"
                aria-describedby="name-error"
              />
              <InputError
                id="name-error"
                name="name"
                messages={{ required: t('languages:language_name_required') }}
              />
            </div>
            <div>
              <FormLabel htmlFor="code">
                {t('languages:code').toUpperCase()}
              </FormLabel>
              <TextInput
                defaultValue={language.data.code}
                id="code"
                className="block w-20"
                disabled
              />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4 lg:flex-row lg:gap-20 py-8 px-10 border-b border-b-green-300">
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-2">Text</h3>
            <p className="text-sm">
              Configure the text of the language as you would like it to appear
              in the platform.
            </p>
          </div>
          <div className="flex-shrink-0 w-80">
            <div className="mb-4">
              <FormLabel htmlFor="language-font">
                {t('languages:font').toUpperCase()}
              </FormLabel>
              <Controller
                name="font"
                rules={{ required: true }}
                render={({ field }) => (
                  <ComboboxInput
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      tryAutosave('font');
                    }}
                    id="font"
                    className="w-full h-10"
                    items={fonts.map((font) => ({ label: font, value: font }))}
                  />
                )}
              />
            </div>
            <div>
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
                      onChange={(value) => {
                        field.onChange(value);
                        tryAutosave('textDirection');
                      }}
                      aria-labelledby="text-direction-label"
                    >
                      <ButtonSelectorOption value={TextDirection.LTR}>
                        <Icon icon="align-left" className="me-2" />
                        {t('languages:ltr')}
                      </ButtonSelectorOption>
                      <ButtonSelectorOption value={TextDirection.RTL}>
                        <Icon icon="align-right" className="me-2" />
                        {t('languages:rtl')}
                      </ButtonSelectorOption>
                    </ButtonSelectorInput>
                  )}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4 lg:flex-row lg:gap-20 py-8 px-10">
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-2">Bible Translations</h3>
            <p className="text-sm">
              These translation are used in the platform when showing a passage
              from the Bible.
            </p>
          </div>
          <div className="flex-shrink-0 w-80">
            <Controller
              name="bibleTranslationIds"
              render={({ field }) => (
                <SortableMultiselectInput
                  {...field}
                  onChange={(value) => {
                    field.onChange(value);
                    tryAutosave('bibleTranslationIds');
                  }}
                  className="w-full"
                  items={translationOptions}
                  placeholder={t('languages:select_translations').toString()}
                />
              )}
            />
          </div>
        </section>
      </Form>
    </div>
  );
}
