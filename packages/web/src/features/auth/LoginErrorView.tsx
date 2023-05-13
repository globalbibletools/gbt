import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function () {
  const { t } = useTranslation('auth');

  const [query] = useSearchParams();
  const error = query.get('error');

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <div className="flex-grow max-w-xs">
          <ViewTitle>{t('login_error')}</ViewTitle>
          <p>
            {(() => {
              switch (error) {
                case 'Verification':
                  return t('verification_error');
                case 'AccessDenied':
                  return t('access_error');
                default:
                  return t('default_error');
              }
            })()}
          </p>
        </div>
      </Card>
    </View>
  );
}
