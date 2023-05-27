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
import { useFlash } from '../../shared/hooks/flash';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import Card from '../../shared/components/Card';

export async function manageLanguageViewLoader({ params }: LoaderFunctionArgs) {
  return apiClient.languages.findByCode(params.code ?? 'unknown');
}

interface FormData {
  name: string;
}

export default function ManageLanguageView() {
  const language = useLoaderData() as GetLanguageResponseBody;
  const flash = useFlash();

  const { t } = useTranslation();

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.update(language.data.code, {
        name: data.name,
      });
      flash.success(t('language_updated'));
    } catch (error) {
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{language.data.name}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              defaultValue={language.data.name}
              required
              aria-describedby="name-error"
            />
            <InputError id="name-error" name="name" context="name" />
          </div>
          <div className="mb-4">
            <FormLabel>{t('code').toUpperCase()}</FormLabel>
            <div>{language.data.code}</div>
          </div>
          <div>
            <Button type="submit">{t('update')}</Button>
            <SubmittingIndicator className="ml-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
