import { StyleSheet, Text, View } from 'react-native';

import type { WeeklyReport } from '@/api/types';
import { MasteryChart } from '@/components/MasteryChart';
import { colors } from '@/theme';

export function WeeklyPanel({ report }: { report: WeeklyReport }) {
  const practice = report.confused[0] || report.weakest[0];
  return (
    <View style={styles.wrap}>
      <View style={styles.stats}>
        <Stat label="Confused" value={String(report.confused.length)} />
        <Stat label="Weakest" value={String(report.weakest.length)} />
        <Stat label="Events" value={String(report.event_count ?? 0)} />
      </View>
      <Text style={styles.caption}>
        Last {report.window_days ?? 7} days
        {report.mean_st != null ? ` · mean confidence ${Number(report.mean_st).toFixed(2)}` : ''}
      </Text>
      {practice ? (
        <View style={styles.practice}>
          <Text style={styles.practiceLabel}>Practice this next</Text>
          <Text style={styles.practiceName}>{practice.name}</Text>
        </View>
      ) : null}
      <Text style={styles.heading}>Weekly mastery</Text>
      <MasteryChart items={report.weakest.length ? report.weakest : report.confused} />
    </View>
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
  wrap: { gap: 14 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  statValue: { color: colors.ink, fontSize: 22, fontWeight: '700', marginTop: 4 },
  caption: { color: colors.muted, fontSize: 13 },
  practice: { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4 },
  practiceLabel: { color: colors.faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  practiceName: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 4 },
});
