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
import useAuth from '../../shared/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '@translation/api-client';

interface FormData {
  email: string;
  password: string;
}

export default function InviteUserView() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

  const { t } = useTranslation('users');
  const flash = useFlash();

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async ({ email, password }) => {
    try {
      await apiClient.auth.login({ email, password });
      refreshAuth();
      navigate('/');
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        flash.error(t('errors.invalid_auth'));
      } else {
        flash.error(`${error}`);
      }
    }
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('log_in')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
            <TextInput
              id="email"
              name="email"
              className="w-full"
              autoComplete="username"
              required
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{
                required: t('errors.email_required'),
              }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="password">
              {t('password').toUpperCase()}
            </FormLabel>
            <TextInput
              id="password"
              type="password"
              name="password"
              className="w-full"
              autoComplete="current-password"
              required
              aria-describedby="password-error"
            />
            <InputError
              id="password-error"
              name="password"
              messages={{
                required: t('errors.password_required'),
              }}
            />
          </div>
          <div>
            <Button type="submit">{t('log_in')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
