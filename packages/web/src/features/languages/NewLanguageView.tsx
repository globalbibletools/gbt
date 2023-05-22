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

export interface FormData {
  code: string;
  name: string;
}

export default function NewLanguageView() {
  const navigate = useNavigate();

  const flash = useFlash();
  const { t } = useTranslation();

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.create({
        code: data.code,
        name: data.name,
      });

      flash.success(t('language_created'));

      navigate('/languages');
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          flash.error(t('language_exists', { code: data.code }));
          return;
        }
      }
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{t('new_language')}</ViewTitle>

        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="code">{t('code').toUpperCase()}</FormLabel>
            <TextInput
              id="code"
              name="code"
              className="block"
              autoComplete="off"
              required
              aria-describedby="code-error"
            />
            <InputError id="code-error" name="code" context="code" />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
              required
              aria-describedby="name-error"
            />
            <InputError id="name-error" name="name" context="name" />
          </div>
          <div>
            <Button type="submit">{t('create')}</Button>
            <SubmittingIndicator className="ml-3" />
          </div>
        </Form>
      </div>
    </View>
  );
}
