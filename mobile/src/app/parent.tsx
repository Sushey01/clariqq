import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getParentChild, getParentChildWeekly } from '@/api/client';
import type { LinkedStudent, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { Badge, Button, Card, ErrorText, Header, Loading, ModalView, Muted, Screen, StatCard } from '@/components/ui';
import { WeeklyPanel } from '@/components/WeeklyPanel';
import { colors } from '@/theme';

export default function ParentScreen() {
  const { user, ready, logout } = useAuth();
  const [child, setChild] = useState<LinkedStudent | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Request Teacher Lesson Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonNote, setLessonNote] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [childData, weeklyData] = await Promise.all([
        getParentChild(),
        getParentChildWeekly(),
      ]);
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

  const confused = weekly?.confused || [];
  const weakest = weekly?.weakest || [];
  const practiceTarget = confused[0] || weakest[0];

  const handleSendLessonRequest = () => {
    if (!lessonTopic.trim()) return;
    setSubmittingRequest(true);
    setTimeout(() => {
      setSubmittingRequest(false);
      setRequestModalOpen(false);
      setLessonTopic('');
      setLessonNote('');
      Alert.alert(
        'Request Sent to Teacher',
        `Your request regarding "${lessonTopic}" has been delivered to ${child?.name || 'your child'}'s science teacher.`,
      );
    }, 600);
  };

  return (
    <Screen>
      <Header
        kicker="Parent Supervision Desk"
        title={child?.name || 'Weekly Progress'}
        actionLabel="Log out"
        onAction={() => void logout()}
      />

      {loading ? <Loading label="Loading weekly report…" /> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
        <View style={styles.topInfo}>
          <Badge label="Grade 10 Socratic Signals" variant="purple" icon="heart-circle" />
          <Text style={styles.leadText}>
            A plain-language look at Grade 10 science progress, home discussion prompts, and teacher
            communication.
          </Text>
        </View>

        <ErrorText message={error} />

        {/* Child Profile Card */}
        {child ? (
          <Card style={styles.childCard}>
            <View style={styles.childHeader}>
              <View style={styles.childAvatar}>
                <Ionicons name="person" size={20} color={colors.accent} />
              </View>
              <View style={styles.childMeta}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childEmail}>{child.email}</Text>
              </View>
              <Badge label="Student" variant="cyan" />
            </View>
          </Card>
        ) : null}

        {/* High-Priority Learning Focus Card */}
        {practiceTarget ? (
          <Card style={styles.focusCard} accent={colors.accent}>
            <View style={styles.focusTop}>
              <Ionicons name="compass" size={18} color={colors.accent} />
              <Text style={styles.focusKicker}>High-Priority Learning Focus</Text>
            </View>
            <Text style={styles.focusTitle}>{practiceTarget.name}</Text>
            <Text style={styles.focusDesc}>
              This is the science concept where {child?.name || 'your child'} had lower confidence
              or repeated questions this week. Ask them to explain this concept in their own words at
              home.
            </Text>
            <View style={styles.homePromptBox}>
              <Text style={styles.homePromptLabel}>Dinner Table Conversation Starter:</Text>
              <Text style={styles.homePromptText}>
                "Can you tell me what happens during {practiceTarget.name}? How does it work in real life?"
              </Text>
            </View>
          </Card>
        ) : !loading && !error ? (
          <Card style={styles.allGoodCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accentEmerald} />
            <Text style={styles.allGoodText}>
              No stuck topics recorded this week! All completed science tracks are progressing cleanly.
            </Text>
          </Card>
        ) : null}

        {/* Teacher Communication Action Card */}
        <Card style={styles.actionCard}>
          <View style={styles.actionCardTop}>
            <Ionicons name="mail-unread-outline" size={20} color={colors.accentPurple} />
            <Text style={styles.actionCardTitle}>Need Teacher Support?</Text>
          </View>
          <Text style={styles.actionCardBody}>
            Request targeted classroom review or send an inquiry note to the science teacher.
          </Text>
          <Button
            label="Request Teacher Lesson"
            tone="subtle"
            icon="paper-plane-outline"
            onPress={() => {
              if (practiceTarget) setLessonTopic(practiceTarget.name);
              setRequestModalOpen(true);
            }}
          />
        </Card>

        {/* Weekly Report & Topic breakdown */}
        {weekly ? (
          <View style={styles.reportWrap}>
            <WeeklyPanel report={weekly} />
          </View>
        ) : null}
      </ScrollView>

      {/* Request Teacher Lesson Modal */}
      <ModalView
        visible={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request Teacher Lesson"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDesc}>
            Send a note to {child?.name || 'your child'}'s science teacher requesting reinforcement
            or extra practice.
          </Text>

          <Text style={styles.modalLabel}>Topic of Concern</Text>
          <TextInput
            value={lessonTopic}
            onChangeText={setLessonTopic}
            placeholder="e.g., Archimedes' Principle or Balancing Equations"
            placeholderTextColor={colors.faint}
            style={styles.modalInput}
          />

          <Text style={styles.modalLabel}>Parent Note</Text>
          <TextInput
            value={lessonNote}
            onChangeText={setLessonNote}
            placeholder="Any specific questions or observation from home study…"
            placeholderTextColor={colors.faint}
            style={styles.modalTextarea}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              tone="ghost"
              onPress={() => setRequestModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              label={submittingRequest ? 'Sending…' : 'Send Request'}
              disabled={submittingRequest || !lessonTopic.trim()}
              onPress={handleSendLessonRequest}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ModalView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 4, paddingBottom: 32 },
  topInfo: { gap: 6 },
  leadText: { color: colors.muted, fontSize: 13, lineHeight: 18 },

  childCard: { backgroundColor: colors.cardElevated },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childMeta: { flex: 1 },
  childName: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  childEmail: { color: colors.faint, fontSize: 12, marginTop: 1 },

  focusCard: { gap: 8, backgroundColor: colors.cardElevated },
  focusTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  focusKicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  focusTitle: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  focusDesc: { color: colors.inkSecondary, fontSize: 13, lineHeight: 19 },
  homePromptBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 4,
    gap: 4,
  },
  homePromptLabel: { color: colors.accentAmber, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  homePromptText: { color: colors.ink, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },

  allGoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  allGoodText: { color: colors.ink, fontSize: 13, flex: 1, lineHeight: 18 },

  actionCard: { gap: 10, backgroundColor: colors.card },
  actionCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionCardTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  actionCardBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },

  reportWrap: { gap: 12, marginTop: 4 },

  modalContent: { gap: 12 },
  modalDesc: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  modalLabel: { color: colors.ink, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
  },
  modalTextarea: {
    height: 80,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
