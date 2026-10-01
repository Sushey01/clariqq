import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { pathForRole } from '@/auth/roles';
import { useAuth } from '@/auth/AuthContext';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { colors } from '@/theme';

const DEMOS = [
  { role: 'student' as const, label: 'Demo student' },
  { role: 'teacher' as const, label: 'Demo teacher' },
  { role: 'parent' as const, label: 'Demo parent' },
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
        <Text style={styles.kicker}>Clariq</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.lead}>Students chat with the tutor. Teachers and parents see a linked student’s weekly mastery.</Text>
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
        <ErrorText message={error} />
        <Button label={busy ? 'Signing in…' : 'Sign in'} disabled={busy} onPress={() => run(() => login({ email, password }))} />
        <Button label="Create a student account" tone="ghost" disabled={busy} onPress={() => router.push('/signup')} />
        <View style={styles.demos}>
          {DEMOS.map((demo) => (
            <Button
              key={demo.role}
              label={demo.label}
              tone="ghost"
              disabled={busy}
              onPress={() => run(() => loginDemo(demo.role))}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 28, paddingBottom: 32 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 34, fontWeight: '700' },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 6 },
  demos: { gap: 10, marginTop: 8 },
});
