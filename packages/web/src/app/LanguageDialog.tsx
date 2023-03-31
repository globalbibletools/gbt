import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog, { DialogRef } from '../shared/components/Dialog';
import { Icon } from '../shared/components/Icon';
import SelectInput from '../shared/components/SelectInput';
import languages from './languages.json';

const LanguageDialog = forwardRef<DialogRef>((_, ref) => {
  const { i18n } = useTranslation();

  return (
    <Dialog ref={ref} className="fixed bottom-4 right-4 m-0">
      <h1 className="text-lg mb-4">
        <Icon icon="earth" className="mr-2" />
        Language
      </h1>

      <SelectInput
        className="block min-w-[150px]"
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.currentTarget.value)}
        aria-label="Interface Language"
      >
        {Object.entries(languages).map(([code, lang]) => (
          <option value={code} key={code}>
            {lang}
          </option>
        ))}
      </SelectInput>
    </Dialog>
  );
});
export default LanguageDialog;
