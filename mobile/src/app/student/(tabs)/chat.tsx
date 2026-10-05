import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useChatSessions } from '@/chat/sessions';
import { Badge, Button, Header, Loading, Screen } from '@/components/ui';
import { STARTER_PROMPTS } from '@/constants/app';
import { colors } from '@/theme';

export default function ChatListScreen() {
  const { ready, sessions, createChat, deleteSession } = useChatSessions();
  const [filterQuery, setFilterQuery] = useState('');

  const openNew = (title?: string, question?: string) => {
    const id = createChat(title, question);
    router.push({ pathname: '/student/session/[id]', params: { id } });
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Question Path',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSession(id) },
      ],
      { cancelable: true },
    );
  };

  const filteredSessions = sessions.filter((s) => {
    if (!filterQuery) return true;
    return s.title.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <Screen>
      <Header
        kicker="Student"
        title="Socratic Desk"
        actionLabel="New Inquiry"
        actionIcon="add"
        onAction={() => openNew()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Quick starter chips */}
        <View style={styles.chipSection}>
          <Text style={styles.chipHeading}>Quick Inquiry Starters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {STARTER_PROMPTS.slice(0, 5).map((starter) => (
              <Pressable
                key={starter.title}
                onPress={() => openNew(`${starter.subject}: ${starter.title}`, starter.query)}
                style={styles.chip}
              >
                <Ionicons name="sparkles" size={12} color={colors.accent} />
                <Text style={styles.chipText}>{starter.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {!ready ? <Loading label="Loading chats…" /> : null}

        {ready && sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>No active question paths</Text>
            <Text style={styles.emptyLead}>
              Start a new conversation with Clariq or choose a bench topic.
            </Text>
            <Button
              label="Start First Inquiry"
              icon="sparkles"
              onPress={() => openNew()}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : null}

        {/* Sessions List */}
        <View style={styles.list}>
          {filteredSessions.map((session) => {
            const lastMsg = session.messages[session.messages.length - 1];
            return (
              <View key={session.id} style={styles.sessionCard}>
                <Pressable
                  accessibilityRole="button"
                  style={styles.sessionMain}
                  onPress={() => router.push({ pathname: '/student/session/[id]', params: { id: session.id } })}
                >
                  <View style={styles.sessionTop}>
                    <Text style={styles.sessionTitle} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <Badge
                      label={`${session.messages.length} ${session.messages.length === 1 ? 'turn' : 'turns'}`}
                      variant={session.messages.length > 0 ? 'cyan' : 'slate'}
                    />
                  </View>

                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {lastMsg ? `${lastMsg.sender === 'user' ? 'You: ' : 'Clariq: '}${lastMsg.text}` : 'No messages yet in this session.'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirmDelete(session.id, session.title)}
                  hitSlop={10}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 14, paddingTop: 4, paddingBottom: 32 },
  chipSection: { gap: 6 },
  chipHeading: { color: colors.faint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipScroll: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
  },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: '600' },

  list: { gap: 10 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    gap: 12,
  },
  sessionMain: { flex: 1, gap: 6 },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sessionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', flex: 1 },
  lastMessage: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 20,
    gap: 8,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  emptyLead: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
