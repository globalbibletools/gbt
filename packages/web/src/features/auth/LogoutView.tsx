import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function LogoutView() {
  const { t } = useTranslation('auth');

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <div className="flex-grow max-w-xs">
          <ViewTitle>{t('log_out')}</ViewTitle>

          <p className="pb-4">{t('log_out_prompt')}</p>
          <div>
            <Button
              className="w-full"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              {t('log_out')}
            </Button>
          </div>
        </div>
      </Card>
    </View>
  );
}
