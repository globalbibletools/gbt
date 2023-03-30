import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';

export default function LanguagesView() {
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    apiClient.languages.findByCode('es').then((response) => {
      if (isMounted) {
        console.log(response);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      {t('languagesView')}
    </div>
  );
}
