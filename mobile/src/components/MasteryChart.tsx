import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import type { Mastery } from '@/api/types';
import { colors, masteryTone } from '@/theme';

export function MasteryChart({ items }: { items: Mastery[] }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No topics in this window yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const score = Number(item.m ?? 0);
        const width: DimensionValue = `${Math.round(Math.max(0, Math.min(1, score)) * 100)}%`;
        const tone = masteryTone(score, item.confused);
        return (
          <View key={item.concept_id || item.name} style={styles.row}>
            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.score, { color: tone }]}>{score.toFixed(2)}</Text>
            </View>
            <Text style={styles.subject}>
              {item.subject}
              {item.chapter ? ` · ${item.chapter}` : ''}
            </Text>
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
  list: { gap: 14 },
  row: { gap: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  name: { color: colors.ink, fontSize: 15, fontWeight: '600', flex: 1 },
  score: { fontVariant: ['tabular-nums'], fontSize: 13, fontWeight: '700' },
  subject: { color: colors.faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  track: { height: 8, borderRadius: 99, backgroundColor: '#16313c', overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 99 },
  empty: { color: colors.muted, fontSize: 14 },
});
