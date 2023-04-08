import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../shared/components/TextInput';
import FormLabel from '../../shared/components/FormLabel';
import Button from '../../shared/components/Button';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';

export default function NewLanguageView() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = (
      e.currentTarget.elements.namedItem('code') as HTMLInputElement
    ).value;
    const name = (
      e.currentTarget.elements.namedItem('name') as HTMLInputElement
    ).value;
    try {
      await apiClient.languages.create({
        data: {
          type: 'language',
          id: code,
          attributes: {
            name,
          },
        },
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          alert(`Language with code "${code}" already exists.`);
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

        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="code">{t('code').toUpperCase()}</FormLabel>
            <TextInput
              id="code"
              name="code"
              className="block"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <Button type="submit">{t('create')}</Button>
          </div>
        </form>
      </div>
    </View>
  );
}
