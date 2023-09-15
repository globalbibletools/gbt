import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useNavigate, useParams } from 'react-router-dom';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { useForm } from 'react-hook-form';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import { useFlash } from '../../shared/hooks/flash';
import Card from '../../shared/components/Card';
import { LanguageRole } from '@translation/api-types';
import MultiselectInput from '../../shared/components/form/MultiselectInput';

interface FormData {
  email: string;
  roles: LanguageRole[];
}

export default function InviteLanguageMemberView() {
  const { code = '' } = useParams<'code'>();
  const navigate = useNavigate();

  const flash = useFlash();
  const { t } = useTranslation(['users']);

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.inviteMember(code, {
        email: data.email,
        roles: data.roles,
      });

      flash.success(t('users:user_invited'));

      navigate(`/languages/${code}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        const alreadyExistsError = error.body.errors.find(
          (error) => error.code === 'AlreadyExists'
        );
        if (alreadyExistsError) {
          flash.error(t('users:errors.user_exists', { email: data.email }));
          return;
        }
      }
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('users:invite_user')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="email">
              {t('users:email').toUpperCase()}
            </FormLabel>
            <TextInput
              id="email"
              type="email"
              name="email"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="email-error"
            />
            <InputError
              id="email-error"
              name="email"
              messages={{ required: t('users:errors.user_email_required') }}
            />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="roles">
              {t('users:role', { count: 100 }).toUpperCase()}
            </FormLabel>
            <MultiselectInput
              className="w-full"
              name="roles"
              defaultValue={[LanguageRole.Translator]}
              items={[
                { label: t('users:role_admin'), value: LanguageRole.Admin },
                {
                  label: t('users:role_translator'),
                  value: LanguageRole.Translator,
                },
              ]}
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
