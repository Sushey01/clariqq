import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { pathForRole } from '@/auth/roles';
import { Badge, Button, Card, ErrorText, Field, Screen } from '@/components/ui';
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
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const session = await signup({ name: name.trim(), email: email.trim(), password });
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.accent} />
          </Pressable>
          <View style={{ gap: 4 }}>
            <Badge label="New Student Profile" variant="cyan" icon="person-add" />
            <Text style={styles.title}>Join Clariq</Text>
            <Text style={styles.lead}>
              Start exploring Grade 10 science through interactive, Socratic question steps.
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          <Field
            label="Full Name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Aarav Sharma"
          />

          <Field
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="aarav@school.edu"
          />

          <Field
            label="Password (min 6 characters)"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <ErrorText message={error} />

          <Button
            label={busy ? 'Creating Account…' : 'Create Student Account'}
            disabled={busy || !name || !email || !password}
            onPress={submit}
            style={{ marginTop: 8 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: 12, paddingBottom: 32 },
  header: { gap: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { color: colors.ink, fontSize: 30, fontWeight: '700' },
  lead: { color: colors.muted, fontSize: 14, lineHeight: 20 },

  formCard: { gap: 12, marginTop: 4 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: { color: colors.muted, fontSize: 13 },
  signInLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
