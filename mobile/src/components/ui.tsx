import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

export function Header({
  kicker,
  title,
  actionLabel,
  onAction,
  onBack,
  actionIcon,
}: {
  kicker?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  onBack?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.accent} />
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
      {actionLabel || actionIcon ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.headerAction} hitSlop={10}>
          {actionIcon ? <Ionicons name={actionIcon} size={18} color={colors.accent} /> : null}
          {actionLabel ? <Text style={styles.actionLabel}>{actionLabel}</Text> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

export function Badge({
  label,
  variant = 'cyan',
  icon,
}: {
  label: string;
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const variantStyles = {
    cyan: { bg: 'rgba(34, 211, 238, 0.12)', border: 'rgba(34, 211, 238, 0.3)', text: colors.accent },
    purple: { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', text: colors.accentPurple },
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: colors.accentEmerald },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: colors.accentAmber },
    rose: { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', text: colors.accentRose },
    slate: { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)', text: colors.muted },
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyles.bg, borderColor: variantStyles.border }]}>
      {icon ? <Ionicons name={icon} size={12} color={variantStyles.text} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.badgeText, { color: variantStyles.text }]}>{label}</Text>
    </View>
  );
}

export function Card({
  children,
  style,
  accent,
}: {
  children: ReactNode;
  style?: object;
  accent?: string;
}) {
  return (
    <View
      style={[
        styles.card,
        accent ? { borderColor: `${accent}40` } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = colors.accent,
}: {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${accent}25` }]}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        {icon ? <Ionicons name={icon} size={16} color={accent} /> : null}
      </View>
      <Text style={[styles.statValue, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

export function Field({
  label,
  icon,
  ...props
}: TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon ? <Ionicons name={icon} size={18} color={colors.faint} style={styles.inputIcon} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.faint}
          style={[styles.input, icon ? { paddingLeft: 38 } : null]}
          autoCapitalize="none"
          {...props}
        />
      </View>
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  tone = 'accent',
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'accent' | 'ghost' | 'subtle' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}) {
  const getStyle = () => {
    switch (tone) {
      case 'ghost':
        return styles.buttonGhost;
      case 'subtle':
        return styles.buttonSubtle;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonAccent;
    }
  };

  const getLabelStyle = () => {
    switch (tone) {
      case 'ghost':
        return styles.buttonLabelGhost;
      case 'subtle':
        return styles.buttonLabelSubtle;
      case 'danger':
        return styles.buttonLabelDanger;
      default:
        return styles.buttonLabelAccent;
    }
  };

  const iconColor = tone === 'accent' ? '#04221c' : tone === 'danger' ? colors.danger : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, getStyle(), style, disabled && styles.disabled]}
    >
      {icon ? <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.buttonLabel, getLabelStyle()]}>{label}</Text>
    </Pressable>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ErrorText({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.mutedText}>{children}</Text>;
}

export function ModalView({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, paddingHorizontal: 18, paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: colors.ink, fontSize: 22, fontWeight: '700', marginTop: 1 },
  headerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLabel: { color: colors.accent, fontSize: 13, fontWeight: '600' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { color: colors.faint, fontSize: 11, textTransform: 'uppercase', fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 4 },

  field: { gap: 6, marginVertical: 4 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  button: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonAccent: { backgroundColor: colors.accent },
  buttonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonSubtle: { backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.borderLight },
  buttonDanger: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderWidth: 1, borderColor: colors.danger },
  buttonLabel: { fontWeight: '700', fontSize: 15 },
  buttonLabelAccent: { color: '#04221c' },
  buttonLabelGhost: { color: colors.ink },
  buttonLabelSubtle: { color: colors.ink },
  buttonLabelDanger: { color: colors.danger },
  disabled: { opacity: 0.4 },

  loading: { padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: colors.muted, fontSize: 13 },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  mutedText: { color: colors.muted, fontSize: 13, lineHeight: 18 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 14,
  },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  modalContent: { gap: 12 },
});
