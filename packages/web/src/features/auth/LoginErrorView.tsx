import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function () {
  const { t } = useTranslation();

  const [query] = useSearchParams();
  const error = query.get('error');

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <div className="flex-grow max-w-xs">
          <ViewTitle>{t('auth_error')}</ViewTitle>
          <p>{error}</p>
        </div>
      </Card>
    </View>
  );
}
