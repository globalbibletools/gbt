import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../shared/components/TextInput';
import FormLabel from '../../shared/components/FormLabel';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/Form';
import InputError from '../../shared/components/InputError';
import SubmitButton from '../../shared/components/SubmitButton';

export interface FormData {
  code: string;
  name: string;
}

export default function NewLanguageView() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.create({
        code: data.code,
        name: data.name,
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          alert(`Language with code "${data.code}" already exists.`);
          return;
        }
      }
      throw error;
    }

    navigate('/languages');
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{t('new_language')}</ViewTitle>

        <Form onSubmit={onSubmit}>
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
            <SubmitButton>{t('create')}</SubmitButton>
          </div>
        </Form>
      </div>
    </View>
  );
}
