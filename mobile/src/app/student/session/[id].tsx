import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { Badge, ErrorText, ModalView, Screen } from '@/components/ui';
import { PERSONAS, QUICK_FOLLOW_UPS, SOCRATIC_MODES, type Persona } from '@/constants/app';
import { saveNoteToNotebook } from '@/storage/notebook';
import { colors } from '@/theme';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, sessions, appendMessage, setSessionMetadata } = useChatSessions();
  const session = sessions.find((item) => item.id === id);

  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'strict' | 'guided' | 'direct'>(session?.mode || 'strict');
  const [personaId, setPersonaId] = useState<string>(session?.personaId || 'socratic-mentor');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const currentPersona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleModeChange = (newMode: 'strict' | 'guided' | 'direct') => {
    setMode(newMode);
    if (session) {
      setSessionMetadata(session.id, { mode: newMode });
    }
  };

  const handleSelectPersona = (p: Persona) => {
    setPersonaId(p.id);
    if (session) {
      setSessionMetadata(session.id, { personaId: p.id });
    }
    setPersonaModalOpen(false);
    showToast(`Switched tutor to ${p.name}`);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (session?.messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [session?.messages.length, sending]);

  const ask = async (customPrompt?: string) => {
    const question = (customPrompt || draft).trim();
    if (!session || !question || sending) return;

    const isFirst = session.messages.filter((m) => m.sender === 'user').length === 0;
    const title =
      isFirst || session.title.startsWith('New') ? titleFromQuestion(question) : undefined;

    appendMessage(session.id, { sender: 'user', text: question }, title);
    if (!customPrompt) setDraft('');
    setSending(true);
    setError('');

    try {
      const reply = await sendChat({ question, sessionId: session.id, socraticMode: mode });
      appendMessage(session.id, {
        sender: 'ai',
        text: reply.answer || 'No reply generated.',
      });
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : 'The tutor could not reply.');
    } finally {
      setSending(false);
    }
  };

  const copyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showToast('Copied to clipboard');
  };

  const saveToNotebook = async (text: string) => {
    const saved = await saveNoteToNotebook({
      title: session?.title || 'Socratic Takeaway',
      text,
      concept: 'Grade 10 Science',
    });
    showToast(saved ? 'Saved to Student Notebook!' : 'Already in notebook');
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.accent} />
          </Pressable>

          <View style={styles.headerInfo}>
            <Text style={styles.sessionTitle} numberOfLines={1}>
              {session?.title || 'Socratic Inquiry'}
            </Text>
            <Text style={styles.sessionSub}>
              {currentPersona.name} · {mode.toUpperCase()}
            </Text>
          </View>

          <Pressable
            onPress={() => setPersonaModalOpen(true)}
            style={styles.personaBtn}
            hitSlop={8}
          >
            <Ionicons name="sparkles" size={16} color={currentPersona.accent} />
            <Text style={[styles.personaBtnText, { color: currentPersona.accent }]}>Persona</Text>
          </Pressable>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeBar}>
          {SOCRATIC_MODES.map((item) => {
            const active = mode === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleModeChange(item.id)}
                style={[styles.modePill, active && styles.modePillActive]}
              >
                <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Toast alert */}
        {toastMessage ? (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={14} color={colors.accentEmerald} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        {/* Messages Scroll Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {!ready ? <Text style={styles.hint}>Loading chat…</Text> : null}
          {ready && !session ? (
            <Text style={styles.hint}>This chat is no longer available on this device.</Text>
          ) : null}

          {session?.messages.length === 0 ? (
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Ionicons name="bulb-outline" size={24} color={colors.accent} />
              </View>
              <Text style={styles.introTitle}>Ask a science idea or question</Text>
              <Text style={styles.introBody}>
                Clariq guides discovery step by step without handing over the formula immediately.
                Ask about Newton's laws, chemical bonds, cells, or astronomy!
              </Text>
            </View>
          ) : null}

          {session?.messages.map((message, index) => {
            const isUser = message.sender === 'user';
            return (
              <View
                key={`${message.sender}-${index}-${message.timestamp || index}`}
                style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}
              >
                {!isUser ? (
                  <View style={styles.tutorHeader}>
                    <View style={styles.groundingBadge}>
                      <Ionicons name="checkmark-done" size={12} color={colors.accentEmerald} />
                      <Text style={styles.groundingText}>Grade 10 CDC Verified</Text>
                    </View>
                    <View style={styles.msgActions}>
                      <Pressable
                        onPress={() => void saveToNotebook(message.text)}
                        hitSlop={8}
                        style={styles.msgActionBtn}
                      >
                        <Ionicons name="bookmark-outline" size={14} color={colors.accent} />
                      </Pressable>
                      <Pressable
                        onPress={() => void copyMessage(message.text)}
                        hitSlop={8}
                        style={styles.msgActionBtn}
                      >
                        <Ionicons name="copy-outline" size={14} color={colors.muted} />
                      </Pressable>
                    </View>
                  </View>
                ) : null}

                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                    {message.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {sending ? (
            <View style={styles.aiWrapper}>
              <View style={styles.typingBubble}>
                <Ionicons name="sparkles" size={14} color={colors.accent} />
                <Text style={styles.typingText}>Tutor is formulating a Socratic question…</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <ErrorText message={error} />

        {/* Quick Follow-up Suggestion Chips */}
        {session && session.messages.length > 0 && !sending ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followUpsScroll}
          >
            {QUICK_FOLLOW_UPS.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => void ask(prompt)}
                style={styles.followUpChip}
              >
                <Text style={styles.followUpText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {/* Input Composer */}
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Answer or ask a science question…"
            placeholderTextColor={colors.faint}
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void ask()}
            disabled={sending || !draft.trim()}
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={18} color="#04221c" />
          </Pressable>
        </View>

        {/* Persona Switcher Modal */}
        <ModalView
          visible={personaModalOpen}
          onClose={() => setPersonaModalOpen(false)}
          title="Choose Tutor Persona"
        >
          <View style={styles.personaList}>
            {PERSONAS.map((p) => {
              const selected = p.id === personaId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleSelectPersona(p)}
                  style={[
                    styles.personaCard,
                    selected && { borderColor: p.accent, backgroundColor: `${p.accent}15` },
                  ]}
                >
                  <View style={styles.personaCardHeader}>
                    <Text style={[styles.personaName, selected && { color: p.accent }]}>
                      {p.name}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={18} color={p.accent} />
                    ) : null}
                  </View>
                  <Text style={styles.personaTagline}>{p.tagline}</Text>
                  <Text style={styles.personaDesc}>{p.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </ModalView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  sessionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sessionSub: { color: colors.muted, fontSize: 11, marginTop: 1 },
  personaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  personaBtnText: { fontSize: 11, fontWeight: '700' },

  modeBar: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: colors.accent,
  },
  modeLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  modeLabelActive: { color: colors.accent, fontWeight: '700' },

  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElevated,
    borderColor: colors.accentEmerald,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  toastText: { color: colors.ink, fontSize: 12, fontWeight: '600' },

  messagesList: { gap: 12, paddingVertical: 14 },
  hint: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 20 },

  introCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    gap: 8,
    marginTop: 10,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  introBody: { color: colors.muted, fontSize: 13, lineHeight: 20 },

  bubbleWrapper: { gap: 4, maxWidth: '88%' },
  userWrapper: { alignSelf: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start' },

  tutorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  groundingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groundingText: { color: colors.accentEmerald, fontSize: 11, fontWeight: '600' },
  msgActions: { flexDirection: 'row', gap: 8 },
  msgActionBtn: { padding: 2 },

  bubble: { borderRadius: 16, padding: 14 },
  userBubble: { backgroundColor: '#0e4a42', borderBottomRightRadius: 4 },
  userBubbleText: { color: '#e7fdf8' },
  aiBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopLeftRadius: 4,
  },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 22 },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    padding: 12,
  },
  typingText: { color: colors.muted, fontSize: 13 },

  followUpsScroll: { gap: 8, paddingVertical: 6 },
  followUpChip: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  followUpText: { color: colors.accent, fontSize: 12, fontWeight: '600' },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },

  personaList: { gap: 10 },
  personaCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    gap: 4,
  },
  personaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personaName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  personaTagline: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  personaDesc: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
