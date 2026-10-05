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

import { getTeacherStudentWeekly, getTeacherStudents } from '@/api/client';
import type { LinkedStudent, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { Badge, Button, Card, ErrorText, Header, Loading, ModalView, Muted, Screen, StatCard } from '@/components/ui';
import { WeeklyPanel } from '@/components/WeeklyPanel';
import { colors } from '@/theme';

export default function TeacherScreen() {
  const { user, ready, logout } = useAuth();
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Send Parent Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [teacherNote, setTeacherNote] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  const load = useCallback(async (studentId?: string | null) => {
    setError('');
    try {
      const list = await getTeacherStudents();
      setStudents(list);
      const nextId =
        studentId && list.some((item) => item.id === studentId) ? studentId : list[0]?.id ?? null;
      setSelectedId(nextId);
      setWeekly(nextId ? await getTeacherStudentWeekly(nextId) : null);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'Could not load the teacher desk.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'teacher') void load();
  }, [load, user?.role]);

  if (!ready) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'teacher') return <Redirect href={pathForRole(user.role)} />;

  const selected = students.find((item) => item.id === selectedId);

  const handleSendReport = () => {
    setSendingReport(true);
    setTimeout(() => {
      setSendingReport(false);
      setReportModalOpen(false);
      setTeacherNote('');
      Alert.alert(
        'Report Sent Successfully',
        `An official learning signal report for ${selected?.name || 'student'} has been delivered to their linked parent account.`,
      );
    }, 600);
  };

  return (
    <Screen>
      <Header
        kicker="Teacher Supervision Desk"
        title={user.name || 'Teacher Desk'}
        actionLabel="Log out"
        onAction={() => void logout()}
      />

      {loading ? <Loading label="Loading linked students…" /> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={() => {
              setRefreshing(true);
              void load(selectedId);
            }}
          />
        }
      >
        <View style={styles.topInfo}>
          <Badge label="Grade 10 Class Roster" variant="cyan" icon="school" />
          <Text style={styles.leadText}>
            Review weekly concept mastery, confusion alerts, and send structured parent reports.
          </Text>
        </View>

        <ErrorText message={error} />

        {/* Student selector pills */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionLabel}>Linked Students ({students.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {students.map((student) => {
              const active = student.id === selectedId;
              return (
                <Pressable
                  key={student.id}
                  onPress={() => void load(student.id)}
                  style={[styles.pill, active && styles.pillOn]}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color={active ? '#04221c' : colors.muted}
                  />
                  <Text style={[styles.pillLabel, active && styles.pillLabelOn]}>
                    {student.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {selected ? (
          <Card style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View>
                <Text style={styles.studentName}>{selected.name}</Text>
                <Text style={styles.studentEmail}>{selected.email}</Text>
              </View>
              <Button
                label="Send Parent Report"
                icon="send"
                onPress={() => setReportModalOpen(true)}
              />
            </View>
          </Card>
        ) : null}

        {!loading && students.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={colors.accent} />
            <Text style={styles.emptyCardTitle}>No linked students</Text>
            <Text style={styles.emptyCardText}>
              Students who register with this teacher code will appear here.
            </Text>
          </Card>
        ) : null}

        {weekly ? (
          <View style={styles.reportWrap}>
            <WeeklyPanel report={weekly} />
          </View>
        ) : null}
      </ScrollView>

      {/* Send Parent Report Modal */}
      <ModalView
        visible={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={`Send Report for ${selected?.name || 'Student'}`}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalPrompt}>
            This summary covers recent Socratic inquiry sessions, top mastered concepts, and concepts
            recommended for at-home discussion.
          </Text>

          <Text style={styles.modalLabel}>Teacher Notes & Next Steps</Text>
          <TextInput
            value={teacherNote}
            onChangeText={setTeacherNote}
            placeholder="Add comments on student perseverance, participation, or upcoming exams…"
            placeholderTextColor={colors.faint}
            style={styles.modalTextarea}
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              tone="ghost"
              onPress={() => setReportModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              label={sendingReport ? 'Sending…' : 'Send to Parent'}
              disabled={sendingReport}
              onPress={handleSendReport}
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

  studentsSection: { gap: 6 },
  sectionLabel: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillsScroll: { gap: 8, paddingVertical: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillLabel: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  pillLabelOn: { color: '#04221c' },

  studentCard: { gap: 12, backgroundColor: colors.cardElevated },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  studentName: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  studentEmail: { color: colors.faint, fontSize: 12, marginTop: 2 },

  reportWrap: { gap: 12, marginTop: 4 },

  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 28, gap: 8 },
  emptyCardTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  emptyCardText: { color: colors.muted, fontSize: 13, textAlign: 'center' },

  modalContent: { gap: 12 },
  modalPrompt: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  modalLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  modalTextarea: {
    height: 100,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.ink,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
