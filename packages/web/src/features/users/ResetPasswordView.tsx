import ModalView, { ModalViewTitle } from '../../shared/components/ModalView';
import Button from '../../shared/components/actions/Button';
import FormLabel from '../../shared/components/form/FormLabel';
import InputError from '../../shared/components/form/InputError';
import SubmitButton from '../../shared/components/form/SubmitButton';
import TextInput from '../../shared/components/form/TextInput';
import { useForm } from 'react-hook-form';
import { useFlash } from '../../shared/hooks/flash';
import apiClient from '../../shared/apiClient';
import { ApiClientError } from '@translation/api-client';
import Form from '../../shared/components/form/Form';
import { useTranslation } from 'react-i18next';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import useAuth from '../../shared/hooks/useAuth';
import { QueryClient, useQuery } from '@tanstack/react-query';

const createResetPasswordQuery = (token?: string) => ({
  queryKey: ['reset-password', token],
  queryFn: () => apiClient.auth.getResetPasswordToken(token ?? ''),
});

export const resetPasswordLoader =
  (queryClient: QueryClient) =>
  ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? undefined;
    return queryClient.ensureQueryData(createResetPasswordQuery(token));
  };

const useResetPasswordTokenQuery = (token?: string) => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof resetPasswordLoader>>
  >;
  return useQuery({
    ...createResetPasswordQuery(token),
    initialData,
  });
};

export default function ResetPasswordView() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const flash = useFlash();
  const formContext = useForm<{ newPassword: string }>();

  const [search] = useSearchParams();
  const token = search.get('token') ?? undefined;

  const { data: resetPasswordToken } = useResetPasswordTokenQuery(token);

  async function onSubmit({ newPassword }: { newPassword: string }) {
    try {
      await apiClient.auth.resetPassword({
        password: newPassword,
        token: token ?? '',
      });
      await apiClient.auth.login({
        email: resetPasswordToken.email,
        password: newPassword,
      });
      refreshAuth();
      navigate('/');
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        flash.error(t('users:errors.invalid_auth'));
      } else {
        flash.error(`${error}`);
      }
    }
  }

  return (
    <ModalView className="max-w-[480px] w-full">
      <ModalViewTitle>New Password</ModalViewTitle>
      <Form
        context={formContext}
        onSubmit={onSubmit}
        className="max-w-[300px] w-full mx-auto"
      >
        <div className="mb-6">
          <FormLabel htmlFor="password">
            {t('users:password').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('newPassword', {
              required: true,
            })}
            id="newPassword"
            type="password"
            className="w-full"
            aria-describedby="password-error"
          />
          <InputError
            id="password-error"
            name="newPassword"
            messages={{
              required: t('users:errors.password_required'),
            }}
          />
        </div>
        <SubmitButton className="w-full">Submit</SubmitButton>
      </Form>
    </ModalView>
  );
}
