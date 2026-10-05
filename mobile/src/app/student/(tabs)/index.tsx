import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getProgressActivity } from '@/api/client';
import type { Activity } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { useChatSessions } from '@/chat/sessions';
import { Badge, Card, Header, Loading, Screen, StatCard } from '@/components/ui';
import { SCIENCE_STATIONS, type ScienceTopic } from '@/constants/app';
import { colors } from '@/theme';

export default function StudentBenchesHubScreen() {
  const { user, logout } = useAuth();
  const { sessions, createChat } = useChatSessions();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    try {
      const data = await getProgressActivity(12);
      setActivity(data);
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const activeSessions = sessions.filter((s) => s.messages.length > 0);
  const lastActive = [...activeSessions].sort(
    (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt),
  )[0];

  const startTopic = (topic: ScienceTopic) => {
    const id = createChat(`${topic.subject}: ${topic.title}`, topic.query);
    router.push({ pathname: '/student/session/[id]', params: { id } });
  };

  const resumeSession = (id: string) => {
    router.push({ pathname: '/student/session/[id]', params: { id } });
  };

  return (
    <Screen>
      <Header
        kicker="Student Lab Floor"
        title={user?.name ? user.name.split(' ')[0] : 'Science Lab'}
        actionLabel="Log out"
        onAction={() => void logout()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadActivity();
            }}
            tintColor={colors.accent}
          />
        }
      >
        {/* Welcome Subtitle */}
        <View style={styles.heroRow}>
          <Badge label="Grade 10 SEE Curriculum" variant="cyan" icon="sparkles" />
          <Text style={styles.heroSub}>Choose a bench. Then take a Socratic turn.</Text>
        </View>

        {/* 3 Metric Cards */}
        <View style={styles.statsRow}>
          <StatCard
            label="Inquiries"
            value={activeSessions.length}
            icon="chatbubbles-outline"
            accent={colors.accent}
          />
          <StatCard
            label="Streak"
            value={activity?.current_streak ? `${activity.current_streak}d` : '0d'}
            icon="flame-outline"
            accent={colors.accentAmber}
          />
          <StatCard
            label="Active Days"
            value={activity?.active_days ?? 0}
            icon="calendar-outline"
            accent={colors.accentEmerald}
          />
        </View>

        {/* Resume Last Session Banner */}
        {lastActive ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => resumeSession(lastActive.id)}
            style={styles.resumeCard}
          >
            <View style={styles.resumeLeft}>
              <View style={styles.resumeIconBox}>
                <Ionicons name="play" size={18} color={colors.accent} />
              </View>
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeKicker}>Resume Active Socratic Path</Text>
                <Text style={styles.resumeTitle} numberOfLines={1}>
                  {lastActive.title}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </Pressable>
        ) : null}

        {/* 4 Science Curriculum Stations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curriculum Science Benches</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any inquiry starter to begin a step-by-step Socratic dialogue.
          </Text>
        </View>

        <View style={styles.stationsList}>
          {SCIENCE_STATIONS.map((station) => (
            <Card key={station.slug} style={styles.stationCard} accent={station.accent}>
              <View style={styles.stationTop}>
                <View style={styles.stationBadgeWrap}>
                  <View style={[styles.stationDot, { backgroundColor: station.accent }]} />
                  <Text style={[styles.stationSubject, { color: station.accent }]}>
                    {station.subject}
                  </Text>
                </View>
                <Text style={styles.stationKicker}>{station.kicker}</Text>
              </View>

              <Text style={styles.stationHeadline}>{station.headline}</Text>
              <Text style={styles.stationBlurb}>{station.blurb}</Text>

              <View style={styles.topicsWrap}>
                {station.topics.map((topic) => (
                  <Pressable
                    key={topic.title}
                    accessibilityRole="button"
                    onPress={() => startTopic(topic)}
                    style={styles.topicBtn}
                  >
                    <View style={styles.topicMain}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={20} color={station.accent} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 16, paddingTop: 4, paddingBottom: 32 },
  heroRow: { gap: 6, marginTop: 4 },
  heroSub: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8 },

  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    padding: 14,
  },
  resumeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  resumeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeInfo: { flex: 1 },
  resumeKicker: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  resumeTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 2 },

  sectionHeader: { marginTop: 8, gap: 2 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  sectionSubtitle: { color: colors.muted, fontSize: 12 },

  stationsList: { gap: 14 },
  stationCard: { gap: 10 },
  stationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stationBadgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stationDot: { width: 8, height: 8, borderRadius: 4 },
  stationSubject: { fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  stationKicker: { color: colors.faint, fontSize: 11, fontWeight: '600' },
  stationHeadline: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  stationBlurb: { color: colors.muted, fontSize: 13, lineHeight: 18 },

  topicsWrap: { gap: 8, marginTop: 4 },
  topicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  topicMain: { flex: 1, marginRight: 10 },
  topicTitle: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  topicSubtitle: { color: colors.faint, fontSize: 11, marginTop: 2 },
});
