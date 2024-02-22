import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import { useFlash } from '../../shared/hooks/flash';
import Button from '../../shared/components/actions/Button';
import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import InputError from '../../shared/components/form/InputError';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
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
    async function onSubmit(data: FormData) {
      try {
        await apiClient.languages.create({
          code: data.code,
          name: data.name,
        });

        flash.success(t('languages:language_created'));

        root.current?.close();
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 409) {
          const alreadyExistsError = error.body.errors.find(
            (error) => error.code === 'AlreadyExists'
          );
          if (alreadyExistsError) {
            flash.error(t('languages:language_exists', { code: data.code }));
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
          <Button className="w-full" type="submit">
            {t('common:create')}
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
  }
);

export default CreateLanguageDialog;
