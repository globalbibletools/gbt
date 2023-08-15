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
import { useEffect } from 'react';

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export default function UpdateProfileView() {
  const { user, refreshAuth } = useAuth();
  const { t } = useTranslation(['users', 'translation']);
  const flash = useFlash();

  const formContext = useForm<FormData>();
  const { setValue } = formContext;
  useEffect(() => {
    if (user) {
      setValue('email', user.email ?? '');
      setValue('name', user.name ?? '');
    }
  }, [setValue, user]);

  const onSubmit: SubmitHandler<FormData> = async ({
    email,
    name,
    password,
  }) => {
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
  };

  if (!user) return null;

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('users:update_profile')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="email">
              {t('users:email').toUpperCase()}
            </FormLabel>
            <TextInput
              id="email"
              name="email"
              type="email"
              className="w-full"
              autoComplete="email"
              required
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{ required: t('users:email_required') }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="name">
              {t('users:name').toUpperCase()}
            </FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="name"
              required
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('users:name_required') }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="password">
              {t('users:password').toUpperCase()}
            </FormLabel>
            <TextInput
              type="password"
              id="password"
              name="password"
              className="w-full"
              autoComplete="new-password"
              minLength={8}
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
              type="password"
              id="confirm-password"
              name="confirmPassword"
              className="w-full"
              autoComplete="new-password"
              confirms="password"
              aria-describedby="confirm-password-error"
            />
            <InputError
              id="confirm-password-error"
              name="confirmPassword"
              messages={{ confirms: t('users:errors.password_confirmation') }}
            />
          </div>
          <div>
            <Button type="submit">{t('translation:update')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
