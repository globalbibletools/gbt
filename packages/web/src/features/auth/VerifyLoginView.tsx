import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function VerifyLoginView() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // Skip login if the user is already authenticated.
  useEffect(() => {
    if (session?.user) {
      navigate('/', { replace: true });
    }
  }, [session?.user, navigate]);

  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <div className="flex-grow max-w-xs">
          <ViewTitle>Sign In Link Sent</ViewTitle>
          <p>Please check your email for a sign in link.</p>
        </div>
      </Card>
    </View>
  );
}
