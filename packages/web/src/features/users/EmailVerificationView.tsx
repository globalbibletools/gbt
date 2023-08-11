import { useTranslation } from 'react-i18next';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { useEffect } from 'react';
import apiClient from '../../shared/apiClient';

export default function EmailVerificationView() {
  const { t } = useTranslation('users');
  const [params] = useSearchParams();

  const { status, mutate } = useMutation({
    async mutationFn(variables: { token: string }) {
      await apiClient.users.verifyEmail(variables.token);
    },
  });

  useEffect(() => {
    mutate({
      token: params.get('token') ?? '',
    });
  }, [mutate, params]);

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        {status === 'loading' || status === 'idle' ? (
          <LoadingSpinner />
        ) : status === 'success' ? (
          t('email_verified')
        ) : (
          t('email_verification_error')
        )}
      </Card>
    </View>
  );
}
