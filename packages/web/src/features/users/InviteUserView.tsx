import { ApiClientError } from '@translation/api-client';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import apiClient from '../../shared/apiClient';
import Form, { SubmitHandler } from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';

export interface FormData {
  email: string;
  name: string;
}

export default function InviteUserView() {
  const { t } = useTranslation();

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async (
    { email, name },
    { reset }
  ) => {
    try {
      await apiClient.users.invite({ email, name });

      // NextAuth doesn't provide a way to send a login link from the server,
      // so we will do that here.
      await apiClient.users.sendInvite({
        email,
        callbackUrl: window.location.origin,
        json: 'true',
      });

      reset();
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

    reset();
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('invite_user')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="name-error"
            />
            <InputError id="name-error" name="name" context="name" />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
            <TextInput
              id="email"
              name="email"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="email-error"
            />
            <InputError id="email-error" name="email" context="email" />
          </div>
          <div>
            <SubmitButton>{t('invite')}</SubmitButton>
          </div>
        </Form>
      </Card>
    </View>
  );
}
