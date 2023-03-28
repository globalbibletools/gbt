import { useTranslation } from 'react-i18next';

export default function TranslationView() {
  const { t } = useTranslation();

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      {t('translationView')}
    </div>
  );
}
