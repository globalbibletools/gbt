import { ApiClientError } from '@translation/api-client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import Button from '../../shared/components/actions/Button';
import BaseComboboxInput from '../../shared/components/form/ComboboxInput';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import TextInput from '../../shared/components/form/TextInput';
import { useFlash } from '../../shared/hooks/flash';
import { languageCodes } from './../../shared/languageCodes';

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
            <BaseComboboxInput
              id="code"
              name="code"
              className="w-full"
              required
              items={languageCodes.map((code, i) => ({
                label: code,
                value: code,
              }))}
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
              disabled={!languageCodes.includes(formContext.getValues().code)}
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
