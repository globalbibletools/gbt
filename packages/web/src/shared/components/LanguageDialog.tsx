import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog, { DialogRef } from './Dialog';
import { Icon } from './Icon';
import languages from '../languages.json';
import ComboboxInput from './form/ComboboxInput';

const LanguageDialog = forwardRef<DialogRef>((_, ref) => {
  const { i18n } = useTranslation(['languages']);

  return (
    <Dialog ref={ref} className="fixed bottom-4 end-4 m-0">
      <h1 className="text-lg mb-4">
        <Icon icon="earth" className="me-2" />
        Language
      </h1>

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
    </Dialog>
  );
});
export default LanguageDialog;
