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

export interface FormData {
  name: string;
}

export default function AcceptInviteView() {
  const { refreshAuth } = useAuth({ requireUnauthenticated: true });

  const [search] = useSearchParams();
  const token = search.get('token') ?? undefined;

  const { data: invite } = useInviteQuery(token);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const flash = useFlash();

  const formContext = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async ({ name }) => {
    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.pathname = '/';
      await apiClient.auth.acceptInvite({
        name,
        token: token ?? '',
      });

      flash.success(t('user_invited'));

      refreshAuth();

      navigate('/');
    } catch (error) {
      flash.error(`${error}`);
    }
  };

  return (
    <View fitToScreen className="flex justify-center items-start">
      <Card className="mx-4 mt-4 w-96 flex-shrink p-6">
        <ViewTitle>{t('invite_user')}</ViewTitle>
        <Form context={formContext} onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="email">{t('email').toUpperCase()}</FormLabel>
            <div>{invite.email}</div>
          </div>
          <div className="mb-2">
            <FormLabel htmlFor="name">{t('name').toUpperCase()}</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              required
              aria-describedby="name-error"
            />
            <InputError id="name-error" name="name" context="name" />
          </div>
          <div>
            <Button type="submit">{t('invite')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
      </Card>
    </View>
  );
}
