import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import { SystemRole } from '@translation/api-types';
import { useFlash } from '../../shared/hooks/flash';
import Button from '../../shared/components/actions/Button';
import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import InputError from '../../shared/components/form/InputError';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import MultiselectInput from '../../shared/components/form/MultiselectInput';
import { useMutation } from '@tanstack/react-query';
import queryClient from '../../shared/queryClient';

interface FormData {
  email: string;
  systemRoles: SystemRole[];
}

export interface InviteUserDialogRef {
  showModal(): void;
}

const InviteUserDialog = forwardRef<InviteUserDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation(['users', 'common']);
  const flash = useFlash();
  const root = useRef<HTMLDialogElement>(null);
  const formContext = useForm<FormData>();

  const { mutateAsync } = useMutation({
    mutationFn({ email, systemRoles }: FormData) {
      return apiClient.users.invite({ email, systemRoles });
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
    onSuccess() {
      flash.success(t('users:user_invited'));
      root.current?.close();

      queryClient.invalidateQueries(['users']);
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
      className="rounded-lg shadow-md bg-white mx-auto p-12 focus-visible:outline outline-green-300 outline-2"
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
            name="systemRoles"
            render={({ field }) => (
              <MultiselectInput
                {...field}
                className="w-full"
                aria-label={t('users:role') ?? ''}
                items={[
                  { label: t('users:role_admin'), value: SystemRole.Admin },
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
        <span className="sr-only">{t('common:close')}</span>
      </Button>
    </dialog>
  );
});

export default InviteUserDialog;
