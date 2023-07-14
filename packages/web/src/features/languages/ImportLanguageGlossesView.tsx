import {
  GetLanguageImportOptionsResponseBody,
  GetLanguageResponseBody,
  SystemRole,
} from '@translation/api-types';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import Button from '../../shared/components/actions/Button';
import { Link } from '../../shared/components/actions/Link';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SelectInput from '../../shared/components/form/SelectInput';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';
import useAuth from '../../shared/hooks/useAuth';

export async function importLanguageGlossesLoader({
  params,
}: LoaderFunctionArgs) {
  const language = await apiClient.languages.findByCode(
    params.code ?? 'unknown'
  );
  const importLanguages = await apiClient.import.languages();
  return { language, importLanguages };
}

interface FormData {
  import: string;
}

export default function ImportLanguageGlossesView() {
  useAuth({ requireRole: [SystemRole.Admin] });
  const { language, importLanguages } = useLoaderData() as {
    language: GetLanguageResponseBody;
    importLanguages: GetLanguageImportOptionsResponseBody;
  };
  const flash = useFlash();

  const { t } = useTranslation();

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.import(language.data.code, data);
      flash.success(t('import_glosses', { context: 'success' }));
    } catch (error) {
      console.error(error);
      flash.error(t('import_glosses', { context: 'error' }));
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
        <div className="flex flex-col gap-4">
          <div>
            <Trans i18nKey="import_description">
              Select a language to import glosses from
              <a
                href="https://hebrewgreekbible.online"
                className="text-blue-600  focus:underline hover:underline"
              >
                hebrewgreekbible.online
              </a>
              .
            </Trans>
          </div>
          <Form context={formContext} onSubmit={onSubmit}>
            <div className="mb-2">
              <FormLabel htmlFor="import">
                {t('import_language').toUpperCase()}
              </FormLabel>
              <SelectInput
                id="import"
                name="import"
                className="w-full"
                autoComplete="off"
                required
                aria-describedby="import-error"
              >
                {importLanguages.data.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </SelectInput>
              <InputError id="import-error" name="import" context="import" />
            </div>
            <div>
              <Button type="submit">
                <Icon icon="file-import" className="me-4"></Icon>
                {t('import_glosses')}
              </Button>
              <SubmittingIndicator className="ms-3" />
            </div>
          </Form>
        </div>
      </div>
    </View>
  );
}
