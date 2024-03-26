import ModalView, { ModalViewTitle } from '../../shared/components/ModalView';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useForm } from 'react-hook-form';
import { useFlash } from '../../shared/hooks/flash';
import apiClient from '../../shared/apiClient';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import { useTranslation } from 'react-i18next';
import useTitle from '../../shared/hooks/useTitle';

export default function ForgotPasswordView() {
  const { t } = useTranslation(['users']);
  useTitle(t('users:forgot_password'));
  const flash = useFlash();

  const formContext = useForm<{ email: string }>();
  async function onSubmit({ email }: { email: string }) {
    try {
      await apiClient.auth.forgotPassword({ email });
      flash.success(t('users:reset_password_link_sent', { email }));
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        flash.error(t('users:errors.invalid_auth'));
      } else {
        flash.error(`${error}`);
      }
    }
  }

  return (
    <ModalView className="max-w-[480px] w-full">
      <ModalViewTitle>{t('users:forgot_password')}</ModalViewTitle>
      <Form
        context={formContext}
        onSubmit={onSubmit}
        className="max-w-[300px] w-full mx-auto"
      >
        <div className="mb-4">
          <FormLabel htmlFor="email">
            {t('users:email').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('email', {
              required: true,
            })}
            id="email"
            className="w-full"
            autoComplete="username"
            aria-describedby="email-error"
          />
          <InputError
            id="email-error"
            name="email"
            messages={{
              required: t('users:errors.email_required'),
            }}
          />
        </div>
        <SubmitButton className="w-full">
          {t('users:reset_password')}
        </SubmitButton>
      </Form>
    </ModalView>
  );
}
