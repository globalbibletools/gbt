import { useQuery } from '@tanstack/react-query';

export default function useSession() {
  const { data, status } = useQuery(['session'], async () => {
    const response = await fetch(`${process.env.API_URL}/api/auth/session`, {
      credentials: 'include',
    });
    return response.json() as Promise<{
      user?: { email?: string; name?: string };
    }>;
  });

  const authStatus = data?.user
    ? 'authenticated'
    : status === 'loading'
    ? 'loading'
    : 'unauthenticated';

  return { session: data ?? {}, status: authStatus };
}
