import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { FormEvent } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import TextInput from '../../shared/components/TextInput';
import FormLabel from '../../shared/components/FormLabel';
import Button from '../../shared/components/Button';
import { GetLanguageResponseBody } from '@translation/api-types';
import { useTranslation } from 'react-i18next';

export async function manageLanguageViewLoader({ params }: LoaderFunctionArgs) {
  return apiClient.languages.findByCode(params.code ?? 'unknown');
}

export default function ManageLanguageView() {
  const language = useLoaderData() as GetLanguageResponseBody;

  const { t } = useTranslation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (
      e.currentTarget.elements.namedItem('name') as HTMLInputElement
    ).value;
    await apiClient.languages.update(language.data.code, {
      name,
    });
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{language.data.name}</ViewTitle>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
              defaultValue={language.data.name}
              required
            />
          </div>
          <div>
            <Button type="submit">{t('update')}</Button>
          </div>
        </form>
      </div>
    </View>
  );
}
