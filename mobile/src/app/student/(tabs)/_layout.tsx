import { Tabs } from 'expo-router';

import { colors } from '@/theme';

export default function StudentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.canvas, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
      }}
    >
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: () => null }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: () => null }} />
    </Tabs>
  );
}
