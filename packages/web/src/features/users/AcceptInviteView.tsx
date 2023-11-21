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
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { QueryClient } from '@tanstack/query-core';
import { useQuery } from '@tanstack/react-query';

const createInviteQuery = (token?: string) => ({
  queryKey: ['invite', token],
  queryFn: () => apiClient.auth.getInvite(token ?? ''),
});

export const acceptInviteLoader =
  (queryClient: QueryClient) =>
  ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? undefined;
    return queryClient.ensureQueryData(createInviteQuery(token));
  };

const useInviteQuery = (token?: string) => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof acceptInviteLoader>>
  >;
  return useQuery({
    ...createInviteQuery(token),
    initialData,
  });
};

interface FormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function AcceptInviteView() {
  const { refreshAuth } = useAuth();

  const [search] = useSearchParams();
  const token = search.get('token') ?? undefined;

  const { data: invite } = useInviteQuery(token);

  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const flash = useFlash();

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async ({
    firstName,
    lastName,
    password,
  }) => {
    try {
      await apiClient.auth.acceptInvite({
        name: `${firstName} ${lastName}`,
        token: token ?? '',
        password,
      });

      flash.success(t('users:user_joined'));

      refreshAuth();

      navigate('/');
    } catch (error) {
      flash.error(`${error}`);
    }
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('users:create_account')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="email">
              {t('users:email').toUpperCase()}
            </FormLabel>
            <input
              id="email"
              className="block w-full"
              readOnly
              defaultValue={invite.email}
            />
          </div>
          <div className="mb-2 flex gap-4">
            <div className="w-full flex-1">
              <FormLabel htmlFor="first-name">
                {t('users:first_name').toUpperCase()}
              </FormLabel>
              <TextInput
                id="first-name"
                name="firstName"
                className="w-full"
                autoComplete="given-name"
                required
                aria-describedby="first-name-error"
              />
              <InputError
                id="first-name-error"
                name="firstName"
                messages={{ required: t('users:errors.name_required') }}
              />
            </div>
            <div className="w-full flex-1">
              <FormLabel htmlFor="last-name">
                {t('users:last_name').toUpperCase()}
              </FormLabel>
              <TextInput
                id="last-name"
                name="lastName"
                className="w-full"
                autoComplete="family-name"
                required
                aria-describedby="last-name-error"
              />
              <InputError
                id="last-name-error"
                name="lastName"
                messages={{ required: t('users:errors.name_required') }}
              />
            </div>
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="password">
              {t('users:password').toUpperCase()}
            </FormLabel>
            <TextInput
              type="password"
              id="password"
              name="password"
              className="w-full"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby="password-error"
            />
            <InputError
              id="password-error"
              name="password"
              messages={{
                required: t('users:errors.password_required'),
                minLength: t('users:errors.password_format'),
              }}
            />
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="confirm-password">
              {t('users:confirm_password').toUpperCase()}
            </FormLabel>
            <TextInput
              type="password"
              id="confirm-password"
              name="confirmPassword"
              className="w-full"
              autoComplete="new-password"
              confirms="password"
              aria-describedby="confirm-password-error"
            />
            <InputError
              id="confirm-password-error"
              name="confirmPassword"
              messages={{ confirms: t('users:errors.password_confirmation') }}
            />
          </div>
          <div>
            <Button type="submit">{t('common:create')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
