import { getCsrfToken, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import FormLabel from '../../shared/components/FormLabel';
import TextInput from '../../shared/components/TextInput';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export async function loginViewLoader() {
  return {
    csrfToken: await getCsrfToken(),
  };
}

export default function LoginView() {
  const { data: session } = useSession();
  const { csrfToken } = useLoaderData() as { csrfToken: string };

  const [query] = useSearchParams();
  const navigate = useNavigate();

  // Skip login if the user is already authenticated.
  useEffect(() => {
    if (session?.user) {
      navigate(query.get('callbackUrl') ?? '/', { replace: true });
    }
  }, [session?.user, navigate, query]);

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <form
          className="flex-grow max-w-xs"
          method="post"
          action="/api/auth/signin/email"
        >
          <ViewTitle>Log In</ViewTitle>

          <input type="hidden" name="csrfToken" defaultValue={csrfToken} />

          <div className="mb-4">
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextInput className="block w-full" name="email" id="email" />
          </div>

          <div>
            <Button type="submit" className="w-full">
              Log In
            </Button>
          </div>
        </form>
      </Card>
    </View>
  );
}
