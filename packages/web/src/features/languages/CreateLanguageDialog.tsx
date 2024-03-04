import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@translation/api-client';
import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import Button from '../../shared/components/actions/Button';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useFlash } from '../../shared/hooks/flash';
import queryClient from '../../shared/queryClient';
import { languageCodes } from './../../shared/languageCodes';

interface FormData {
  code: string;
  name: string;
}

export interface CreateLanguageDialogRef {
  showModal(): void;
}

const CreateLanguageDialog = forwardRef<CreateLanguageDialogRef, unknown>(
  (_, ref) => {
    const { t } = useTranslation(['languages', 'common']);
    const flash = useFlash();
    const root = useRef<HTMLDialogElement>(null);
    const formContext = useForm<FormData>();

    const { mutateAsync } = useMutation({
      mutationFn({ code, name }: FormData) {
        return apiClient.languages.create({ code, name });
      },
      onError(error, { code }) {
        if (error instanceof ApiClientError && error.status === 409) {
          const alreadyExistsError = error.body.errors.find(
            (error) => error.code === 'AlreadyExists'
          );
          if (alreadyExistsError) {
            flash.error(t('languages:language_exists', { code }));
            return;
          }
        }
        flash.error(`${error}`);
      },
      onSuccess() {
        flash.success(t('languages:language_created'));
        root.current?.close();

        queryClient.invalidateQueries(['languages']);
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
            {t('languages:new_language')}
          </h2>
          <div className="mb-4">
            <FormLabel htmlFor="name">
              {t('common:name').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('name', {
                required: true,
              })}
              id="name"
              className="w-full"
              autoComplete="off"
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('languages:language_name_required') }}
            />
          </div>
          <div className="mb-8">
            <FormLabel htmlFor="code">
              {t('languages:code').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('code', {
                required: true,
                validate: {
                  valid: (code: string) => languageCodes.includes(code),
                },
              })}
              id="code"
              className="w-full"
              autoComplete="off"
              aria-describedby="code-error"
            />
            <InputError
              id="code-error"
              name="code"
              messages={{
                required: t('languages:language_code_errors.required'),
                valid: t('languages:language_code_errors.valid'),
              }}
            />
          </div>
          <SubmitButton className="w-full">{t('common:create')}</SubmitButton>
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
  }
);

export default CreateLanguageDialog;
