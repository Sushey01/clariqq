import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getProgress, getProgressActivity, getWeeklyReport } from '@/api/client';
import type { Activity, Mastery, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { MasteryChart } from '@/components/MasteryChart';
import { Badge, Card, ErrorText, Header, Loading, Muted, Screen, StatCard } from '@/components/ui';
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
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const load = useCallback(async () => {
    setError('');
    try {
      const [progress, report, streak] = await Promise.all([
        getProgress(),
        getWeeklyReport(),
        getProgressActivity(12),
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

  const masteredCount = mastery.filter((m) => Number(m.m) >= 0.7 && !m.confused).length;
  const practicingCount = mastery.filter((m) => Number(m.m) >= 0.45 && Number(m.m) < 0.7 && !m.confused).length;
  const confusedCount = mastery.filter((m) => m.confused).length;

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology', 'Earth'];
  const filteredMastery = mastery.filter((m) => {
    if (selectedSubject === 'All') return true;
    return m.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  // Recent 14 days grid from activity
  const recentDays = activity?.days ? activity.days.slice(-14) : [];

  return (
    <Screen>
      <Header kicker="Mastery & Signals" title="Progress" actionLabel="Log out" onAction={() => void logout()} />

      {loading ? <Loading label="Loading mastery records…" /> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <ErrorText message={error} />

        {/* Activity Streak Grid */}
        <Card style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.streakTitleRow}>
              <Ionicons name="flame" size={20} color={colors.accentAmber} />
              <Text style={styles.streakTitle}>Socratic Turn Activity</Text>
            </View>
            <Badge
              label={`${activity?.current_streak ?? 0} Day Streak`}
              variant="amber"
              icon="flame"
            />
          </View>

          {/* Mini 14-day commit heatmap blocks */}
          <View style={styles.heatmapRow}>
            {recentDays.length > 0 ? (
              recentDays.map((d, i) => {
                const count = d.count;
                const active = count > 0;
                return (
                  <View key={d.date || i} style={styles.heatmapCol}>
                    <View
                      style={[
                        styles.heatmapCell,
                        active
                          ? { backgroundColor: count > 3 ? colors.accentEmerald : 'rgba(16, 185, 129, 0.45)' }
                          : { backgroundColor: colors.surfaceLight },
                      ]}
                    />
                    <Text style={styles.heatmapDayText}>
                      {d.date ? d.date.split('-')[2] : ''}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Muted>Take chat turns to build your daily learning streak.</Muted>
            )}
          </View>

          <View style={styles.streakStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{activity?.current_streak ?? 0}</Text>
              <Text style={styles.miniStatLabel}>Current Streak</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{activity?.longest_streak ?? 0}</Text>
              <Text style={styles.miniStatLabel}>Best Streak</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{activity?.active_days ?? 0}</Text>
              <Text style={styles.miniStatLabel}>Active Days</Text>
            </View>
          </View>
        </Card>

        {/* 3 Status Summary Stat Cards */}
        <View style={styles.summaryRow}>
          <StatCard label="Mastered" value={masteredCount} icon="checkmark-circle-outline" accent={colors.accentEmerald} />
          <StatCard label="Practicing" value={practicingCount} icon="time-outline" accent={colors.accentAmber} />
          <StatCard label="Review" value={confusedCount} icon="alert-circle-outline" accent={colors.accentRose} />
        </View>

        {/* Weekly Report Component */}
        {weekly ? <WeeklyPanel report={weekly} /> : null}

        {/* Subject Filter Pills */}
        <View style={styles.headingSection}>
          <Text style={styles.heading}>Concept Knowledge Map</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {subjects.map((subj) => (
              <View
                key={subj}
                style={[
                  styles.subjPill,
                  selectedSubject === subj && styles.subjPillActive,
                ]}
              >
                <Text
                  onPress={() => setSelectedSubject(subj)}
                  style={[
                    styles.subjPillText,
                    selectedSubject === subj && styles.subjPillTextActive,
                  ]}
                >
                  {subj}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Topic Mastery breakdown */}
        {filteredMastery.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="school-outline" size={28} color={colors.accent} />
            <Text style={styles.emptyCardText}>
              No scored turns in {selectedSubject === 'All' ? 'any subject' : selectedSubject} yet. Chat at the Socratic desk to build your mastery map.
            </Text>
          </Card>
        ) : (
          <MasteryChart items={filteredMastery} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: 4, paddingBottom: 32 },
  streakCard: { gap: 14, backgroundColor: colors.cardElevated },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },

  heatmapRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, paddingVertical: 4 },
  heatmapCol: { alignItems: 'center', gap: 4 },
  heatmapCell: { width: 16, height: 16, borderRadius: 4 },
  heatmapDayText: { color: colors.faint, fontSize: 9 },

  streakStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  miniStat: { alignItems: 'center' },
  miniStatVal: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  miniStatLabel: { color: colors.faint, fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  miniDivider: { width: 1, height: 24, backgroundColor: colors.borderLight, alignSelf: 'center' },

  summaryRow: { flexDirection: 'row', gap: 8 },

  headingSection: { gap: 8, marginTop: 4 },
  heading: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  pillsScroll: { gap: 6, paddingVertical: 2 },
  subjPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  subjPillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: colors.accent,
  },
  subjPillText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  subjPillTextActive: { color: colors.accent },

  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  emptyCardText: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
