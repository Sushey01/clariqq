import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { pathForRole } from '@/auth/roles';
import { useAuth } from '@/auth/AuthContext';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { colors } from '@/theme';

export default function SignupScreen() {
  const { user, ready, signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Redirect href={pathForRole(user.role)} />;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const session = await signup({ name, email, password });
      router.replace(pathForRole(session.role));
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Student account</Text>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.lead}>New accounts are students. Teacher and parent desks use an existing login.</Text>
        <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <ErrorText message={error} />
        <Button label={busy ? 'Creating…' : 'Create account'} disabled={busy} onPress={submit} />
        <Button label="Back to sign in" tone="ghost" disabled={busy} onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingTop: 28, paddingBottom: 32 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 34, fontWeight: '700' },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 6 },
});
