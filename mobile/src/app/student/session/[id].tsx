import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { sendChat } from '@/api/client';
import { titleFromQuestion, useChatSessions } from '@/chat/sessions';
import { ErrorText, Screen } from '@/components/ui';
import { colors } from '@/theme';

const MODES = [
  { id: 'strict', label: 'Strict' },
  { id: 'guided', label: 'Guided' },
  { id: 'direct', label: 'Direct' },
];

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, sessions, appendMessage } = useChatSessions();
  const session = sessions.find((item) => item.id === id);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState('strict');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const ask = async () => {
    const question = draft.trim();
    if (!session || !question || sending) return;
    const isFirst = session.messages.filter((message) => message.sender === 'user').length === 0;
    const title =
      isFirst || session.title === 'New session' ? titleFromQuestion(question) : undefined;
    appendMessage(session.id, { sender: 'user', text: question }, title);
    setDraft('');
    setSending(true);
    setError('');
    try {
      const reply = await sendChat({ question, sessionId: session.id, socraticMode: mode });
      appendMessage(session.id, { sender: 'ai', text: reply.answer || 'No reply.' });
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'The tutor could not reply.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {session?.title || 'Chat'}
          </Text>
        </View>
        <View style={styles.modes}>
          {MODES.map((item) => (
            <Pressable key={item.id} onPress={() => setMode(item.id)} style={[styles.mode, mode === item.id && styles.modeOn]}>
              <Text style={[styles.modeLabel, mode === item.id && styles.modeLabelOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView contentContainerStyle={styles.messages}>
          {!ready ? <Text style={styles.hint}>Loading chat…</Text> : null}
          {ready && !session ? <Text style={styles.hint}>This chat is no longer on this phone.</Text> : null}
          {session?.messages.length === 0 ? (
            <Text style={styles.hint}>Ask a science question. Clariq replies with one question at a time in Strict mode.</Text>
          ) : null}
          {session?.messages.map((message, index) => (
            <View
              key={`${message.sender}-${index}`}
              style={[styles.bubble, message.sender === 'user' ? styles.user : styles.ai]}
            >
              <Text style={styles.bubbleText}>{message.text}</Text>
            </View>
          ))}
          {sending ? <Text style={styles.hint}>Tutor is thinking…</Text> : null}
        </ScrollView>
        <ErrorText message={error} />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask about a science idea"
            placeholderTextColor={colors.faint}
            style={styles.input}
            multiline
          />
          <Pressable onPress={() => void ask()} disabled={sending || !draft.trim()} style={styles.send}>
            <Text style={styles.sendLabel}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  back: { color: colors.accent, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '700', flex: 1 },
  modes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  mode: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  modeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  modeLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  modeLabelOn: { color: '#04221c' },
  messages: { gap: 10, paddingVertical: 16 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  bubble: { maxWidth: '88%', borderRadius: 16, padding: 12 },
  user: { alignSelf: 'flex-end', backgroundColor: '#145e52' },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  composer: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingBottom: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  send: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  sendLabel: { color: '#04221c', fontWeight: '700' },
});
