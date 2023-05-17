import { ApiClientError } from '@translation/api-client';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/FormLabel';
import TextInput from '../../shared/components/TextInput';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function InviteUserView() {
  const { t } = useTranslation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const emailInput = e.currentTarget.elements.namedItem(
      'email'
    ) as HTMLInputElement;
    const email = emailInput.value;
    try {
      // await apiClient.languages.create({
      //   code,
      //   name,
      // });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          alert(`User with email "${email}" has already been invited.`);
          return;
        }
      }
      throw error;
    }

    emailInput.value = '';
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('invite_user')}</ViewTitle>
        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
            <TextInput
              id="email"
              name="email"
              className="block w-full"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <Button type="submit">{t('invite')}</Button>
          </div>
        </form>
      </Card>
    </View>
  );
}
