import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { GetLanguageResponseBody } from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';

export async function manageLanguageViewLoader({ params }: LoaderFunctionArgs) {
  return apiClient.languages.findByCode(params.code ?? 'unknown');
}

interface FormData {
  name: string;
}

export default function ManageLanguageView() {
  const language = useLoaderData() as GetLanguageResponseBody;

  const { t } = useTranslation();

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    await apiClient.languages.update(language.data.code, {
      name: data.name,
    });
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{language.data.name}</ViewTitle>

        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
              defaultValue={language.data.name}
              required
              aria-describedby="name-error"
            />
            <InputError id="name-error" name="name" context="name" />
          </div>
          <div>
            <SubmitButton>{t('update')}</SubmitButton>
          </div>
        </Form>
      </div>
    </View>
  );
}
