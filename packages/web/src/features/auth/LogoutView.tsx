import { signOut } from 'next-auth/react';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';

export default function LogoutView() {
  return (
    <View fitToScreen className="flex items-start justify-center">
      <Card className="m-4 mt-8 pt-8 pb-10 max-w-lg flex-grow flex justify-center">
        <div className="flex-grow max-w-xs">
          <ViewTitle>Log Out</ViewTitle>

          <p className="pb-4">Are you sure you want to log out?</p>
          <div>
            <Button
              className="w-full"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </View>
  );
}
