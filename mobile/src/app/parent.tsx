import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

import { getParentChild, getParentChildWeekly } from '@/api/client';
import type { LinkedStudent, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { ErrorText, Header, Loading, Muted, Screen } from '@/components/ui';
import { WeeklyPanel } from '@/components/WeeklyPanel';
import { colors } from '@/theme';

export default function ParentScreen() {
  const { user, ready, logout } = useAuth();
  const [child, setChild] = useState<LinkedStudent | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [childData, weeklyData] = await Promise.all([getParentChild(), getParentChildWeekly()]);
      setChild(childData);
      setWeekly(weeklyData);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'Could not load the parent desk.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'parent') void load();
  }, [load, user?.role]);

  if (!ready) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'parent') return <Redirect href={pathForRole(user.role)} />;

  return (
    <Screen>
      <Header kicker="Parent" title={child?.name || 'This week'} actionLabel="Log out" onAction={() => void logout()} />
      {loading ? <Loading label="Loading this week…" /> : null}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
      >
        <Muted>A weekly look at how {child?.name || 'your child'} is doing. This is not a gradebook.</Muted>
        <ErrorText message={error} />
        {child ? <Text style={styles.email}>{child.email}</Text> : null}
        {weekly ? <WeeklyPanel report={weekly} /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 16, paddingBottom: 28 },
  email: { color: colors.faint, fontSize: 13 },
});
