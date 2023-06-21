import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import apiClient from '../../shared/apiClient';
import Form, { SubmitHandler } from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import Button from '../../shared/components/actions/Button';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import { useFlash } from '../../shared/hooks/flash';
import useAuth from '../../shared/hooks/useAuth';
import { useState } from 'react';

export interface FormData {
  email: string;
  name: string;
}

export default function InviteUserView() {
  useAuth({ requireUnauthenticated: true });

  const { t } = useTranslation();
  const flash = useFlash();

  const [step, setStep] = useState<'email' | 'final'>('email');

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async ({ email }, { reset }) => {
    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.pathname = '/';
      await apiClient.auth.login({
        email,
        redirectUrl: redirectUrl.toString(),
      });
      setStep('final');
    } catch (error) {
      flash.error(`${error}`);
    }
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('log_in')}</ViewTitle>
        {step === 'email' && (
          <Form context={formContext} onSubmit={onSubmit}>
            <div className="mb-4">
              <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
              <TextInput
                id="email"
                name="email"
                className="w-full"
                autoComplete="off"
                required
                aria-describedby="email-error"
              />
              <InputError id="email-error" name="email" context="email" />
            </div>
            <div>
              <Button type="submit">{t('log_in')}</Button>
              <SubmittingIndicator className="ms-3" />
            </div>
          </Form>
        )}
        {step === 'final' && <p>{t('login_message')}</p>}
      </Card>
    </View>
  );
}