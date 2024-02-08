import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function useTitle(title: string) {
  const { t } = useTranslation(['common']);
  const appName = t('common:app_name');
  useEffect(() => {
    document.title = `${title} | ${appName}`;
  }, [title, appName]);
}
