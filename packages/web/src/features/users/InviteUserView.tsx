import { ApiClientError } from '@translation/api-client';
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
import useTitle from '../../shared/hooks/useTitle';
import { useQueryClient } from '@tanstack/react-query';

interface FormData {
  email: string;
}

export default function InviteUserView() {
  const { t } = useTranslation(['users']);
  useTitle(t('common:tab_titles.invite_user'));
  const flash = useFlash();

  const queryClient = useQueryClient();

  const formContext = useForm<FormData>();
  async function onSubmit({ email }: FormData) {
    try {
      await apiClient.users.invite({ email });
      queryClient.invalidateQueries(['session']);

      flash.success(t('users:user_invited'));
      formContext.reset();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          flash.error(t('users:errors.user_exists', { email }));
          return;
        }
      }
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="flex-shrink p-6 mx-4 mt-4 w-96">
        <ViewTitle>{t('users:invite_user')}</ViewTitle>
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
              autoComplete="off"
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{ required: t('users:errors.user_email_required') }}
            />
          </div>
          <div>
            <Button type="submit">{t('users:invite')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
