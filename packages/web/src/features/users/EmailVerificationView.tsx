import { useTranslation } from 'react-i18next';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { useEffect } from 'react';
import apiClient from '../../shared/apiClient';
import useAuth from '../../shared/hooks/useAuth';
import useTitle from '../../shared/hooks/useTitle';

export default function EmailVerificationView() {
  const { t } = useTranslation(['users']);
  useTitle('common:tab_titles.verify_email');
  const [params] = useSearchParams();
  const { refreshAuth } = useAuth();

  const { status, mutate } = useMutation({
    async mutationFn(variables: { token: string }) {
      await apiClient.users.verifyEmail(variables.token);
    },
    onSuccess() {
      refreshAuth();
    },
  });

  useEffect(() => {
    mutate({
      token: params.get('token') ?? '',
    });
  }, [mutate, params]);

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="flex-shrink p-6 mx-4 mt-4 w-96">
        {status === 'loading' || status === 'idle' ? (
          <LoadingSpinner />
        ) : status === 'success' ? (
          t('users:email_verified')
        ) : (
          t('users:email_verification_error')
        )}
      </Card>
    </View>
  );
}
