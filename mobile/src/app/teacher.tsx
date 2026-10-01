import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getTeacherStudentWeekly, getTeacherStudents } from '@/api/client';
import type { LinkedStudent, WeeklyReport } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { ErrorText, Header, Loading, Muted, Screen } from '@/components/ui';
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

  const load = useCallback(async (studentId?: string | null) => {
    setError('');
    try {
      const list = await getTeacherStudents();
      setStudents(list);
      const nextId = studentId && list.some((item) => item.id === studentId) ? studentId : list[0]?.id ?? null;
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

  return (
    <Screen>
      <Header kicker="Teacher" title={user.name} actionLabel="Log out" onAction={() => void logout()} />
      {loading ? <Loading label="Loading students…" /> : null}
      <ScrollView
        contentContainerStyle={styles.content}
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
        <Muted>Weekly mastery for students linked to this account.</Muted>
        <ErrorText message={error} />
        <View style={styles.pills}>
          {students.map((student) => (
            <Pressable
              key={student.id}
              onPress={() => void load(student.id)}
              style={[styles.pill, student.id === selectedId && styles.pillOn]}
            >
              <Text style={[styles.pillLabel, student.id === selectedId && styles.pillLabelOn]}>{student.name}</Text>
            </Pressable>
          ))}
        </View>
        {selected ? <Text style={styles.student}>{selected.name}</Text> : null}
        {!loading && students.length === 0 ? <Muted>No linked students yet.</Muted> : null}
        {weekly ? <WeeklyPanel report={weekly} /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 16, paddingBottom: 28 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  pillOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillLabel: { color: colors.ink, fontWeight: '600' },
  pillLabelOn: { color: '#04221c' },
  student: { color: colors.ink, fontSize: 20, fontWeight: '700' },
});
