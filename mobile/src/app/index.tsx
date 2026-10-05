import { Redirect } from 'expo-router';

import { pathForRole } from '@/auth/roles';
import { useAuth } from '@/auth/AuthContext';
import { Loading, Screen } from '@/components/ui';

export default function Index() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <Screen>
        <Loading label="Opening Clariq…" />
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={pathForRole(user.role)} />;
}
