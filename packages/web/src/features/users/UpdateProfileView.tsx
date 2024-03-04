import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useFlash } from '../../shared/hooks/flash';
import useAuth from '../../shared/hooks/useAuth';
import useTitle from '../../shared/hooks/useTitle';

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export default function UpdateProfileView() {
  const { user, refreshAuth } = useAuth();
  const { t } = useTranslation(['common', 'users']);
  const flash = useFlash();
  useTitle(t('common:tab_titles.update_profile'));

  const formContext = useForm<FormData>();
  const { setValue } = formContext;
  useEffect(() => {
    if (user) {
      setValue('email', user.email ?? '');
      setValue('name', user.name ?? '');
    }
  }, [setValue, user]);

  async function onSubmit({ email, name, password }: FormData) {
    try {
      if (user) {
        await apiClient.users.update({
          id: user.id,
          email,
          name,
          password,
        });
      }

      setValue('password', '');
      setValue('confirmPassword', '');

      refreshAuth();

      flash.success(t('users:profile_updated'));
    } catch (error) {
      flash.error(`${error}`);
    }
  }

  if (!user) return null;

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="flex-shrink p-6 mx-4 mt-4 w-96">
        <ViewTitle>{t('users:update_profile')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="email">
              {t('users:email').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('email', {
                required: true,
              })}
              id="email"
              type="email"
              className="w-full"
              autoComplete="email"
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{ required: t('users:errors.email_required') }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="name">
              {t('common:name').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('name', {
                required: true,
              })}
              id="name"
              className="w-full"
              autoComplete="name"
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('users:errors.name_required') }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="password">
              {t('users:password').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('password', {
                minLength: 8,
              })}
              type="password"
              id="password"
              className="w-full"
              autoComplete="new-password"
              aria-describedby="password-error"
            />
            <InputError
              id="password-error"
              name="password"
              messages={{
                required: t('users:errors.password_required'),
                minLength: t('users:errors.password_format'),
              }}
            />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="confirm-password">
              {t('users:confirm_password').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('confirmPassword', {
                validate: {
                  confirms: (value: unknown) =>
                    value === formContext.getValues().password,
                },
              })}
              type="password"
              id="confirm-password"
              className="w-full"
              autoComplete="new-password"
              aria-describedby="confirm-password-error"
            />
            <InputError
              id="confirm-password-error"
              name="confirmPassword"
              messages={{ confirms: t('users:errors.password_confirmation') }}
            />
          </div>
          <div>
            <SubmitButton>{t('common:update')}</SubmitButton>
          </div>
        </Form>
      </Card>
    </View>
  );
}
