import { ApiClientError } from '@translation/api-client';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import ConfirmationDialog, {
  ConfirmationDialogRef,
} from '../../shared/components/ConfirmationDialog';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ViewTitle from '../../shared/components/ViewTitle';
import Button from '../../shared/components/actions/Button';
import Link from '../../shared/components/actions/Link';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import SubmitButton from '../../shared/components/form/SubmitButton';
import { useFlash } from '../../shared/hooks/flash';

export async function manageLanguageImportViewLoader({
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

export default function ManageLanguageImportView() {
  const { language, importLanguages, currentJob } = useLoaderData() as Awaited<
    ReturnType<typeof manageLanguageImportViewLoader>
  >;

  const { t } = useTranslation(['users', 'common']);

  const flash = useFlash();
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
    <div className="px-8 py-6 w-fit">
      <div className="flex items-baseline mb-4">
        <ViewTitle>
          {t('languages:import_glosses', {
            context: 'title',
            languageName: language.data.name,
          })}
        </ViewTitle>
      </div>
      {(() => {
        switch (importStatus) {
          case 'running': {
            return (
              <div>
                <p className="mb-4">{t('languages:import_glosses_running')}</p>
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              </div>
            );
          }
          case 'error': {
            return (
              <div>
                <p className="mb-4">{t('languages:import_glosses_error')}</p>
                <Button onClick={() => setImportStatus('idle')}>
                  {t('common:try_again')}
                </Button>
              </div>
            );
          }
          case 'complete': {
            return (
              <div>
                <p className="mb-4">{t('languages:import_glosses_success')}</p>
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
                    <Link to="https://hebrewgreekbible.online">
                      hebrewgreekbible.online
                    </Link>
                    . o{' '}
                  </Trans>
                </div>
                <Form context={formContext} onSubmit={onSubmit}>
                  <div className="mb-2">
                    <FormLabel htmlFor="import">
                      {t('languages:import_language').toUpperCase()}
                    </FormLabel>
                    <Controller
                      name="import"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <ComboboxInput
                          {...field}
                          id="import"
                          className="w-full"
                          autoComplete="off"
                          aria-describedby="import-error"
                          items={importLanguages.data.map((language) => ({
                            label: language,
                            value: language,
                          }))}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <SubmitButton>
                      <Icon icon="file-import" className="me-4" />
                      {t('languages:import_glosses')}
                    </SubmitButton>
                  </div>
                </Form>
              </div>
            );
          }
        }
      })()}
      <ConfirmationDialog
        ref={confirmationDialog}
        title={t('languages:import_glosses')}
        description={t('languages:import_glosses_confirmation_warning')}
        confirmationValue={formContext.getValues()['import']}
      />
    </div>
  );
}
