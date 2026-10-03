import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { ChatSessionsProvider } from '@/chat/sessions';
import { Loading, Screen } from '@/components/ui';
import { colors } from '@/theme';

export default function StudentLayout() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'student') return <Redirect href={pathForRole(user.role)} />;

  return (
    <ChatSessionsProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
    </ChatSessionsProvider>
  );
}
