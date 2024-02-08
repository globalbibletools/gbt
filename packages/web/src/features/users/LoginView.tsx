import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import apiClient from '../../shared/apiClient';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import Button from '../../shared/components/actions/Button';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';
import useAuth from '../../shared/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '@translation/api-client';
import useTitle from '../../shared/hooks/useTitle';

interface FormData {
  email: string;
  password: string;
}

export default function InviteUserView() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['users']);
  useTitle(t('common:tab_titles.login'));

  const flash = useFlash();

  const formContext = useForm<FormData>();
  async function onSubmit({ email, password }: FormData) {
    try {
      await apiClient.auth.login({ email, password });
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
    <View fitToScreen className="flex items-start justify-center">
      <Card className="flex-shrink p-6 mx-4 mt-4 w-96">
        <ViewTitle>{t('users:log_in')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
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
          <div className="mb-2">
            <FormLabel htmlFor="password">
              {t('users:password').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('password', {
                required: true,
              })}
              id="password"
              type="password"
              className="w-full"
              autoComplete="current-password"
              aria-describedby="password-error"
            />
            <InputError
              id="password-error"
              name="password"
              messages={{
                required: t('users:errors.password_required'),
              }}
            />
          </div>
          <div>
            <Button type="submit">{t('users:log_in')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
