import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import type { Mastery } from '@/api/types';
import { BENCH_ACCENT, colors, masteryLabel, masteryTone } from '@/theme';

export function MasteryChart({ items }: { items: Mastery[] }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No topics in this window yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const score = Number(item.m ?? 0);
        const percent = Math.round(Math.max(0, Math.min(1, score)) * 100);
        const width: DimensionValue = `${percent}%`;
        const tone = masteryTone(score, item.confused);
        const label = masteryLabel(score, item.confused);
        const subjectColor = BENCH_ACCENT[item.subject] || colors.accent;

        return (
          <View key={item.concept_id || item.name} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.subjectBadge}>
                <View style={[styles.dot, { backgroundColor: subjectColor }]} />
                <Text style={styles.subjectText}>
                  {item.subject}
                  {item.chapter ? ` · ${item.chapter}` : ''}
                </Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: `${tone}40`, backgroundColor: `${tone}15` }]}>
                {item.confused ? (
                  <Ionicons name="alert-circle" size={12} color={tone} style={{ marginRight: 3 }} />
                ) : null}
                <Text style={[styles.statusLabel, { color: tone }]}>{label}</Text>
              </View>
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.score, { color: tone }]}>{percent}%</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width, backgroundColor: tone }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subjectText: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  score: {
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    paddingVertical: 12,
  },
});
