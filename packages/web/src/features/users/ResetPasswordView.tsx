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
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../shared/hooks/useAuth';
import useTitle from '../../shared/hooks/useTitle';

export default function ResetPasswordView() {
  const { t } = useTranslation(['users', 'common']);
  useTitle(t('users:reset_password'));

  const { refreshAuth } = useAuth();

  const [search] = useSearchParams();
  const token = search.get('token') ?? undefined;

  const navigate = useNavigate();
  const flash = useFlash();

  const formContext = useForm<{ newPassword: string }>();
  async function onSubmit({ newPassword }: { newPassword: string }) {
    try {
      await apiClient.auth.resetPassword({
        password: newPassword,
        token: token ?? '',
      });
      refreshAuth();
      navigate('/');
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
      <ModalViewTitle>{t('users:new_password')}</ModalViewTitle>
      <Form
        context={formContext}
        onSubmit={onSubmit}
        className="max-w-[300px] w-full mx-auto"
      >
        <div className="mb-6">
          <FormLabel htmlFor="newPassword">
            {t('users:password').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('newPassword', {
              required: true,
            })}
            id="newPassword"
            type="password"
            className="w-full"
            aria-describedby="password-error"
          />
          <InputError
            id="password-error"
            name="newPassword"
            messages={{
              required: t('users:errors.password_required'),
            }}
          />
        </div>
        <SubmitButton className="w-full">{t('common:confirm')}</SubmitButton>
      </Form>
    </ModalView>
  );
}
