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
import Button from '../../shared/components/actions/Button';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';

interface FormData {
  email: string;
}

export default function InviteUserView() {
  const { t } = useTranslation('users');
  const flash = useFlash();

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async ({ email }, { reset }) => {
    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.pathname = '/invite';
      await apiClient.users.invite({
        email,
        redirectUrl: redirectUrl.toString(),
      });

      flash.success(t('user_invited'));
      reset();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          flash.error(t('errors.user_exists', { email }));
          return;
        }
      }
      flash.error(`${error}`);
    }
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('invite_user')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
            <TextInput
              id="email"
              name="email"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{ required: t('errors.user_email_required') }}
            />
          </div>
          <div>
            <Button type="submit">{t('invite')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
