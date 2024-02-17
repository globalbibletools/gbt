import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/form/FormLabel';
import TextInput from '../../shared/components/form/TextInput';
import ModalView, { ModalViewTitle } from '../../shared/components/ModalView';
import apiClient from '../../shared/apiClient';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import Button from '../../shared/components/actions/Button';
import Link from '../../shared/components/actions/Link';
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
import useTitle from '../../shared/hooks/useTitle';

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
  const { t } = useTranslation(['users', 'common']);
  useTitle('common:tab_titles.accept_invite');

  const { refreshAuth } = useAuth();

  const [search] = useSearchParams();
  const token = search.get('token') ?? undefined;

  const { data: invite } = useInviteQuery(token);

  const navigate = useNavigate();
  const flash = useFlash();

  const formContext = useForm<FormData>();
  async function onSubmit({ firstName, lastName, password }: FormData) {
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
  }

  return (
    <ModalView
      className="max-w-[480px] w-full"
      header={
        <Button to="/login" variant="tertiary">
          Log In
        </Button>
      }
    >
      <ModalViewTitle>{t('users:create_account')}</ModalViewTitle>
      <Form
        context={formContext}
        onSubmit={onSubmit}
        className="max-w-[320px] w-full mx-auto"
      >
        <div className="mb-4">
          <FormLabel htmlFor="email">
            {t('users:email').toUpperCase()}
          </FormLabel>
          <TextInput
            id="email"
            className="w-full bg-gray-200"
            readOnly
            defaultValue={invite.email}
          />
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 w-full">
            <FormLabel htmlFor="first-name">
              {t('users:first_name').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('firstName', {
                required: true,
              })}
              id="first-name"
              className="w-full"
              autoComplete="given-name"
              aria-describedby="first-name-error"
            />
            <InputError
              id="first-name-error"
              name="firstName"
              messages={{ required: t('users:errors.name_required') }}
            />
          </div>
          <div className="flex-1 w-full">
            <FormLabel htmlFor="last-name">
              {t('users:last_name').toUpperCase()}
            </FormLabel>
            <TextInput
              {...formContext.register('lastName', {
                required: true,
              })}
              id="last-name"
              className="w-full"
              autoComplete="family-name"
              aria-describedby="last-name-error"
            />
            <InputError
              id="last-name-error"
              name="lastName"
              messages={{ required: t('users:errors.name_required') }}
            />
          </div>
        </div>
        <div className="mb-4">
          <FormLabel htmlFor="password">
            {t('users:password').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('password', {
              required: true,
              minLength: 8,
            })}
            type="password"
            id="password"
            className="w-full"
            autoComplete="new-password"
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
        <div className="mb-6">
          <FormLabel htmlFor="confirm-password">
            {t('users:confirm_password').toUpperCase()}
          </FormLabel>
          <TextInput
            {...formContext.register('confirmPassword', {
              required: true,
              validate: {
                confirms: (value: unknown) =>
                  value === formContext.getValues().password,
              },
            })}
            type="password"
            id="confirm-password"
            className="w-full"
            autoComplete="new-password"
            aria-describedby="confirm-password-error"
          />
          <InputError
            id="confirm-password-error"
            name="confirmPassword"
            messages={{ confirms: t('users:errors.password_confirmation') }}
          />
        </div>
        <Button className="w-full" type="submit">
          {t('common:create')}
        </Button>
        <div>
          <SubmittingIndicator className="ms-3" />
        </div>
      </Form>
    </ModalView>
  );
}
