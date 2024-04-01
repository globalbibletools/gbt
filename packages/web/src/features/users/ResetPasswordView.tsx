import ModalView, { ModalViewTitle } from '../../shared/components/ModalView';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useForm } from 'react-hook-form';
import { useFlash } from '../../shared/hooks/flash';
import apiClient from '../../shared/apiClient';
import Form from '../../shared/components/form/Form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../shared/hooks/useAuth';
import useTitle from '../../shared/hooks/useTitle';
import { useEffect } from 'react';

export default function ResetPasswordView() {
  const { t } = useTranslation(['users', 'common']);
  useTitle(t('users:reset_password'));

  const { refreshAuth } = useAuth();

  const [search] = useSearchParams();
  const token = search.get('token') ?? '';

  const navigate = useNavigate();
  const flash = useFlash();

  useEffect(() => {
    if (!token) {
      navigate('/');
      flash.error(t('users:errors.no_reset_password_token'));
    }
  }, [token, flash, navigate, t]);

  const formContext = useForm<{
    newPassword: string;
    confirmNewPassword: string;
  }>();
  async function onSubmit({ newPassword }: { newPassword: string }) {
    try {
      await apiClient.auth.resetPassword({
        password: newPassword,
        token,
      });
      refreshAuth();
      navigate('/');
    } catch (error) {
      flash.error(`${error}`);
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
        <div className="mb-4">
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
            autoComplete="new-password"
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
        <div className="mb-6">
          <FormLabel htmlFor="confirm-new-password">
            {t('users:confirm_password').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('confirmNewPassword', {
              validate: {
                confirms: (value: unknown) =>
                  value === formContext.getValues().newPassword,
              },
            })}
            type="password"
            id="confirm-new-password"
            className="w-full"
            autoComplete="new-password"
            aria-describedby="confirm-password-error"
          />
          <InputError
            id="confirm-password-error"
            name="confirmNewPassword"
            messages={{ confirms: t('users:errors.password_confirmation') }}
          />
        </div>
        <SubmitButton className="w-full">{t('common:confirm')}</SubmitButton>
      </Form>
    </ModalView>
  );
}
