import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { WeeklyReport } from '@/api/types';
import { MasteryChart } from '@/components/MasteryChart';
import { colors } from '@/theme';

export function WeeklyPanel({ report }: { report: WeeklyReport }) {
  const practice = report.confused[0] || report.weakest[0];

  return (
    <View style={styles.wrap}>
      <View style={styles.stats}>
        <View style={[styles.stat, { borderColor: 'rgba(244, 63, 94, 0.25)' }]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Stuck Topics</Text>
            <Ionicons name="alert-circle-outline" size={14} color={colors.accentRose} />
          </View>
          <Text style={[styles.statValue, { color: colors.accentRose }]}>{report.confused.length}</Text>
        </View>

        <View style={[styles.stat, { borderColor: 'rgba(245, 158, 11, 0.25)' }]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Weakest</Text>
            <Ionicons name="trending-down-outline" size={14} color={colors.accentAmber} />
          </View>
          <Text style={[styles.statValue, { color: colors.accentAmber }]}>{report.weakest.length}</Text>
        </View>

        <View style={[styles.stat, { borderColor: 'rgba(34, 211, 238, 0.25)' }]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Inquiries</Text>
            <Ionicons name="chatbubbles-outline" size={14} color={colors.accent} />
          </View>
          <Text style={[styles.statValue, { color: colors.accent }]}>{report.event_count ?? 0}</Text>
        </View>
      </View>

      <Text style={styles.caption}>
        Window: Last {report.window_days ?? 7} days
        {report.mean_st != null ? ` · Average Confidence ${Math.round(Number(report.mean_st) * 100)}%` : ''}
      </Text>

      {practice ? (
        <View style={styles.practice}>
          <View style={styles.practiceHeader}>
            <Ionicons name="compass-outline" size={16} color={colors.accent} />
            <Text style={styles.practiceLabel}>High-Priority Socratic Focus</Text>
          </View>
          <Text style={styles.practiceName}>{practice.name}</Text>
          <Text style={styles.practiceBlurb}>
            Lower confidence observed during active turns. Ask for clarification at the Socratic desk.
          </Text>
        </View>
      ) : null}

      <Text style={styles.heading}>Curriculum Topics Explored</Text>
      <MasteryChart items={report.weakest.length ? report.weakest : report.confused} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.faint,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  caption: {
    color: colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  practice: {
    backgroundColor: colors.cardElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    gap: 6,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  practiceLabel: {
    color: colors.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  practiceName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  practiceBlurb: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
});
