import {
  GetLanguageImportOptionsResponseBody,
  GetLanguageResponseBody,
  SystemRole,
} from '@translation/api-types';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import ConfirmationDialog, {
  ConfirmationDialogRef,
} from '../../shared/components/ConfirmationDialog';
import { Icon } from '../../shared/components/Icon';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import Button from '../../shared/components/actions/Button';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import SelectInput from '../../shared/components/form/SelectInput';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';

export async function importLanguageGlossesLoader({
  params,
}: LoaderFunctionArgs) {
  const language = await apiClient.languages.findByCode(
    params.code ?? 'unknown'
  );
  const importLanguages = await apiClient.import.getLanguages();
  return { language, importLanguages };
}

interface FormData {
  import: string;
}

export default function ImportLanguageGlossesView() {
  const { language, importLanguages } = useLoaderData() as {
    language: GetLanguageResponseBody;
    importLanguages: GetLanguageImportOptionsResponseBody;
  };
  const flash = useFlash();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const confirmationDialog = useRef<ConfirmationDialogRef>(null);

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    const confirmed = await confirmationDialog.current?.open();
    if (confirmed) {
      try {
        await apiClient.languages.import(language.data.code, data);
        navigate(`/languages/${language.data.code}`);
        flash.success(t('import_glosses', { context: 'success' }));
      } catch (error) {
        console.error(error);
        flash.error(t('import_glosses', { context: 'error' }));
      }
    }
  }

  return (
    <>
      <View fitToScreen className="flex justify-center items-start">
        <div className="mx-4 flex-shrink">
          <ViewTitle className="flex">
            {t('import_glosses', {
              context: 'title',
              languageName: language.data.name,
            })}
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
      <ConfirmationDialog
        ref={confirmationDialog}
        title={t('import_glosses')}
        description={t('import_glosses_confirmation_warning')}
        confirmationValue={formContext.getValues()['import']}
      />
    </>
  );
}
