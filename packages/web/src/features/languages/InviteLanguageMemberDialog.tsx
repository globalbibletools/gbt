import apiClient from '../../shared/apiClient';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { Controller, useForm } from 'react-hook-form';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import { useFlash } from '../../shared/hooks/flash';
import { GetSessionResponse, LanguageRole } from '@translation/api-types';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import { useQueryClient } from '@tanstack/react-query';
import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { Icon } from '../../shared/components/Icon';

interface FormData {
  email: string;
  roles: LanguageRole[];
}

export interface InviteLanguageMemberDialogProps {
  languageCode: string;
}

export interface InviteLanguageMemberDialogRef {
  showModal(): void;
}

const InviteLanguageMemberDialog = forwardRef<
  InviteLanguageMemberDialogRef,
  InviteLanguageMemberDialogProps
>(({ languageCode }, ref) => {
  const { t } = useTranslation(['common', 'users']);

  const flash = useFlash();
  const queryClient = useQueryClient();

  const root = useRef<HTMLDialogElement>(null);

  const formContext = useForm<FormData>({
    defaultValues: {
      roles: [LanguageRole.Translator],
    },
  });
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.inviteMember(languageCode, {
        email: data.email,
        roles: data.roles,
      });
      const session: GetSessionResponse | undefined = queryClient.getQueryData([
        'session',
      ]);
      if (!session || session.user?.email === data.email)
        queryClient.invalidateQueries(['session']);

      flash.success(t('users:user_invited'));

      root.current?.close();
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

  useImperativeHandle(ref, () => ({
    showModal() {
      root.current?.showModal();
    },
  }));

  return (
    <dialog
      ref={root}
      className="rounded-lg shadow-md bg-white mx-auto p-12 focus-visible:outline outline-green-300 outline-2"
    >
      <Form context={formContext} onSubmit={onSubmit}>
        <h2 className="font-bold text-xl mb-6 text-center">
          {t('users:invite_user')}
        </h2>
        <div className="mb-4">
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
            autoComplete="off"
            aria-describedby="email-error"
          />
          <InputError
            id="email-error"
            name="email"
            messages={{ required: t('users:errors.user_email_required') }}
          />
        </div>
        <div className="mb-8">
          <FormLabel htmlFor="roles">
            {t('users:role', { count: 100 }).toUpperCase()}
          </FormLabel>
          <Controller
            name="roles"
            render={({ field }) => (
              <MultiselectInput
                {...field}
                className="w-full"
                items={[
                  { label: t('users:role_admin'), value: LanguageRole.Admin },
                  {
                    label: t('users:role_translator'),
                    value: LanguageRole.Translator,
                  },
                ]}
              />
            )}
          />
        </div>
        <Button className="w-full" type="submit">
          {t('users:invite')}
        </Button>
        <SubmittingIndicator className="ms-3" />
      </Form>
      <Button
        className="absolute right-2 top-2 w-9"
        variant="tertiary"
        destructive
        onClick={(e: MouseEvent) =>
          (e.target as HTMLElement).closest('dialog')?.close()
        }
      >
        <Icon icon="xmark" />
        <span className="sr-only">Close</span>
      </Button>
    </dialog>
  );
});

export default InviteLanguageMemberDialog;
