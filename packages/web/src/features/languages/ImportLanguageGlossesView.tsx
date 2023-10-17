import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
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
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';
import { ApiClientError } from '@translation/api-client';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ComboboxInput from '../../shared/components/form/ComboboxInput';

export async function importLanguageGlossesLoader({
  params,
}: LoaderFunctionArgs) {
  const language = await apiClient.languages.findByCode(
    params.code ?? 'unknown'
  );
  const importLanguages = await apiClient.import.getLanguages();
  let currentJob;
  try {
    currentJob = await apiClient.languages.getImportStatus(
      params.code ?? 'unknown'
    );
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 404) {
      throw error;
    }
  }
  return { language, importLanguages, currentJob };
}

interface FormData {
  import: string;
}

export default function ImportLanguageGlossesView() {
  const { language, importLanguages, currentJob } = useLoaderData() as Awaited<
    ReturnType<typeof importLanguageGlossesLoader>
  >;
  const flash = useFlash();
  const { t } = useTranslation(['common', 'languages']);
  const confirmationDialog = useRef<ConfirmationDialogRef>(null);

  const formContext = useForm<FormData>();

  const [importStatus, setImportStatus] = useState<
    'idle' | 'running' | 'complete' | 'error'
  >(() => {
    if (currentJob) {
      if (currentJob.endDate) {
        // This lets the user start a new import if the previous import was more than 24 hours ago.
        // Otherwise this view would always default to the status of the previous job.
        if (
          Date.now() - new Date(currentJob.endDate).valueOf() <
          24 * 60 * 60 * 1000 // 24 hours
        ) {
          return currentJob.succeeded ? 'complete' : 'error';
        } else {
          return 'idle';
        }
      } else {
        return 'running';
      }
    } else {
      return 'idle';
    }
  });
  const pollTimeout = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (importStatus === 'running') {
      const checkImportStatus = async () => {
        const job = await apiClient.languages.getImportStatus(
          language.data.code
        );
        if (job.endDate) {
          if (job.succeeded) {
            setImportStatus('complete');
          } else {
            setImportStatus('error');
          }
        } else {
          pollTimeout.current = setTimeout(checkImportStatus, 5000);
        }
      };

      pollTimeout.current = setTimeout(checkImportStatus, 5000);
    }
  }, [importStatus, language.data.code]);

  useEffect(() => {
    return () => {
      if (pollTimeout.current) {
        clearTimeout(pollTimeout.current);
      }
    };
  }, []);

  async function onSubmit(data: FormData) {
    const confirmed = await confirmationDialog.current?.open();
    if (confirmed) {
      try {
        await apiClient.languages.startImport(language.data.code, data);
        setImportStatus('running');
      } catch (error) {
        console.error(error);
        flash.error(t('languages:import_glosses', { context: 'error' }));
      }
    }
  }

  return (
    <>
      <View fitToScreen className="flex justify-center items-start">
        <div className="mx-4 flex-shrink">
          <ViewTitle className="flex">
            {t('languages:import_glosses', {
              context: 'title',
              languageName: language.data.name,
            })}
          </ViewTitle>
          {(() => {
            switch (importStatus) {
              case 'running': {
                return (
                  <div>
                    <p className="mb-4">
                      {t('languages:import_glosses_running')}
                    </p>
                    <div className="flex justify-center">
                      <LoadingSpinner />
                    </div>
                  </div>
                );
              }
              case 'error': {
                return (
                  <div>
                    <p className="mb-4">
                      {t('languages:import_glosses_error')}
                    </p>
                    <Button onClick={() => setImportStatus('idle')}>
                      {t('common:try_again')}
                    </Button>
                  </div>
                );
              }
              case 'complete': {
                return (
                  <div>
                    <p className="mb-4">
                      {t('languages:import_glosses_success')}
                    </p>
                    <Button onClick={() => setImportStatus('idle')}>
                      {t('common:try_again')}
                    </Button>
                  </div>
                );
              }
              case 'idle': {
                return (
                  <div className="flex flex-col gap-4">
                    <div>
                      <Trans i18nKey="languages:import_description">
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
                          {t('languages:import_language').toUpperCase()}
                        </FormLabel>
                        <ComboboxInput
                          id="import"
                          name="import"
                          className="w-full"
                          autoComplete="off"
                          required
                          aria-describedby="import-error"
                          items={importLanguages.data.map((language) => ({
                            label: language,
                            value: language,
                          }))}
                        />
                      </div>
                      <div>
                        <Button type="submit">
                          <Icon icon="file-import" className="me-4"></Icon>
                          {t('languages:import_glosses')}
                        </Button>
                        <SubmittingIndicator className="ms-3" />
                      </div>
                    </Form>
                  </div>
                );
              }
            }
          })()}
        </div>
      </View>
      <ConfirmationDialog
        ref={confirmationDialog}
        title={t('languages:import_glosses')}
        description={t('languages:import_glosses_confirmation_warning')}
        confirmationValue={formContext.getValues()['import']}
      />
    </>
  );
}
