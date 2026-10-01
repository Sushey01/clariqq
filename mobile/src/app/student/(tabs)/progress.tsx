import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getProgress, getProgressActivity, getWeeklyReport } from '@/api/client';
import type { Activity, Mastery, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { ErrorText, Header, Loading, Muted, Screen } from '@/components/ui';
import { WeeklyPanel } from '@/components/WeeklyPanel';
import { colors } from '@/theme';

export default function ProgressScreen() {
  const { logout } = useAuth();
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [progress, report, streak] = await Promise.all([
        getProgress(),
        getWeeklyReport(),
        getProgressActivity(),
      ]);
      setMastery(progress);
      setWeekly(report);
      setActivity(streak);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'Could not load progress.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Header kicker="Student" title="Progress" actionLabel="Log out" onAction={() => void logout()} />
      {loading ? <Loading label="Loading progress…" /> : null}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.accent} />}
      >
        <ErrorText message={error} />
        {activity ? (
          <View style={styles.stats}>
            <Stat label="Streak" value={String(activity.current_streak)} />
            <Stat label="Longest" value={String(activity.longest_streak)} />
            <Stat label="Active days" value={String(activity.active_days)} />
          </View>
        ) : null}
        {weekly ? <WeeklyPanel report={weekly} /> : null}
        <Text style={styles.heading}>Topics you have touched</Text>
        {mastery.length === 0 && !loading ? <Muted>Chat while signed in to start a mastery record.</Muted> : null}
        {mastery.map((item) => (
          <View key={item.concept_id} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Muted>
              {item.subject} · {Number(item.m).toFixed(2)}
              {item.confused ? ' · confused' : ''}
            </Muted>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 18, paddingBottom: 28 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.faint, fontSize: 11, textTransform: 'uppercase' },
  statValue: { color: colors.ink, fontSize: 22, fontWeight: '700', marginTop: 4 },
  heading: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 6 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4 },
  name: { color: colors.ink, fontSize: 15, fontWeight: '600' },
});
