import { MouseEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import languages from '../languages.json';
import ComboboxInput from './form/ComboboxInput';
import Button from './actions/Button';

export interface LanguageDialogRef {
  show(): void;
}

const LanguageDialog = forwardRef<LanguageDialogRef>((_, ref) => {
  const { i18n } = useTranslation(['languages']);

  const root = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    show() {
      root.current?.show();
    },
  }));

  return (
    <dialog
      ref={root}
      className="rounded-lg shadow-md border border-gray-200 bg-white mx-auto p-8 focus-visible:outline outline-green-300 outline-2 end-2 bottom-2 start-auto"
    >
      <h2 className="font-bold text-xl mb-6 text-center">
        <Icon icon="language" className="me-2" />
        Language
      </h2>
      <ComboboxInput
        className="block min-w-[150px]"
        value={i18n.resolvedLanguage}
        onChange={(language) => i18n.changeLanguage(language)}
        aria-label="Interface Language"
        up
        items={Object.entries(languages).map(([value, label]) => ({
          label,
          value,
        }))}
      />
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
export default LanguageDialog;
