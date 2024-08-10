import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@translation/api-client';
import { GetSessionResponse, LanguageRole } from '@translation/api-types';
import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import Button from '../../shared/components/actions/Button';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useFlash } from '../../shared/hooks/flash';

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

  const { mutateAsync } = useMutation({
    mutationFn({ email, roles }: FormData) {
      return apiClient.languages.inviteMember(languageCode, {
        email,
        roles,
      });
    },
    onError(error, { email }) {
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
    },
    onSuccess(_, { email }) {
      const session: GetSessionResponse | undefined = queryClient.getQueryData([
        'session',
      ]);
      if (!session || session.user?.email === email)
        queryClient.invalidateQueries(['session']);

      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['language-members', languageCode]);

      root.current?.close();
      flash.success(t('users:user_invited'));
    },
  });

  useImperativeHandle(ref, () => ({
    showModal() {
      root.current?.showModal();
    },
  }));

  return (
    <dialog
      ref={root}
      className="
        rounded-lg shadow-md bg-white mx-auto p-12 focus-visible:outline outline-green-300 outline-2
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
      "
    >
      <Form context={formContext} onSubmit={(data) => mutateAsync(data)}>
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
        <SubmitButton className="w-full">{t('users:invite')}</SubmitButton>
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
        <span className="sr-only">{t('common:close')}</span>
      </Button>
    </dialog>
  );
});

export default InviteLanguageMemberDialog;
