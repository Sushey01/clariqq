import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { Badge, Button, Card, ErrorText, Field, Screen } from '@/components/ui';
import { colors } from '@/theme';

const DEMOS = [
  { role: 'student' as const, label: 'Student Lab Desk', icon: 'flask-outline' as const, accent: colors.accent },
  { role: 'teacher' as const, label: 'Teacher Supervision', icon: 'school-outline' as const, accent: colors.accentEmerald },
  { role: 'parent' as const, label: 'Parent Desk', icon: 'heart-outline' as const, accent: colors.accentPurple },
];

export default function LoginScreen() {
  const { user, ready, login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Redirect href={pathForRole(user.role)} />;

  const run = async (task: () => Promise<{ role: string }>) => {
    setBusy(true);
    setError('');
    try {
      const session = await task();
      router.replace(pathForRole(session.role));
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Brand header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
          </View>
          <View style={{ gap: 4 }}>
            <Badge label="Grade 10 Socratic AI" variant="cyan" />
            <Text style={styles.title}>Welcome to Clariq</Text>
            <Text style={styles.lead}>
              Inquiry-based science learning. Choose your role or try an instant demo desk.
            </Text>
          </View>
        </View>

        {/* 1-Tap Quick Demo Access Card */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoKicker}>Instant 1-Tap Demo Desks</Text>
          <View style={styles.demoButtonsRow}>
            {DEMOS.map((demo) => (
              <Pressable
                key={demo.role}
                disabled={busy}
                onPress={() => run(() => loginDemo(demo.role))}
                style={({ pressed }) => [
                  styles.demoBtn,
                  { borderColor: `${demo.accent}40` },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name={demo.icon} size={16} color={demo.accent} />
                <Text style={[styles.demoBtnText, { color: demo.accent }]}>{demo.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Sign in credentials */}
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in with Email</Text>

          <Field
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="student@school.edu"
          />

          <Field
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
          />

          <ErrorText message={error} />

          <Button
            label={busy ? 'Signing in…' : 'Sign in to Account'}
            disabled={busy || !email || !password}
            onPress={() => run(() => login({ email, password }))}
            style={{ marginTop: 6 }}
          />

          <View style={styles.signupFooter}>
            <Text style={styles.footerText}>New to Clariq?</Text>
            <Pressable onPress={() => router.push('/signup')} hitSlop={8}>
              <Text style={styles.signupLink}>Create an account</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: 16, paddingBottom: 32 },
  brandHeader: { gap: 10 },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  title: { color: colors.ink, fontSize: 30, fontWeight: '700' },
  lead: { color: colors.muted, fontSize: 14, lineHeight: 20 },

  demoCard: { gap: 10, backgroundColor: colors.cardElevated, borderColor: colors.borderGlow },
  demoKicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  demoButtonsRow: { gap: 8 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  demoBtnText: { fontSize: 14, fontWeight: '700' },

  formCard: { gap: 10 },
  formTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  signupFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: { color: colors.muted, fontSize: 13 },
  signupLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
