import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { useForm } from 'react-hook-form';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import { useFlash } from '../../shared/hooks/flash';
import Card from '../../shared/components/Card';
import AutocompleteInput from '../../shared/components/form/AutocompleteInput';
import { langCodes } from './../../shared/languageCodes';

interface FormData {
  code: string;
  name: string;
}

export default function NewLanguageView() {
  const navigate = useNavigate();

  const flash = useFlash();
  const { t } = useTranslation(['common', 'languages']);

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.create({
        code: data.code,
        name: data.name,
      });

      flash.success(t('languages:language_created'));

      navigate('/languages');
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          flash.error(t('languages:language_exists', { code: data.code }));
          return;
        }
      }
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('languages:new_language')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="code">
              {t('languages:code').toUpperCase()}
            </FormLabel>
            <AutocompleteInput
              id="code"
              name="code"
              className="w-full"
              required
              suggestions={langCodes}
              aria-describedby="code-error"
            />
            <InputError
              id="code-error"
              name="code"
              messages={{ required: t('languages:language_code_required') }}
            />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="name">
              {t('common:name').toUpperCase()}
            </FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('languages:language_name_required') }}
            />
          </div>
          <div>
            <Button
              type="submit"
              disabled={!langCodes.includes(formContext.getValues().code)}
            >
              {t('common:create')}
            </Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
