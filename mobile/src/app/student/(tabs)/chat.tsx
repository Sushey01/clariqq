import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { useChatSessions } from '@/chat/sessions';
import { Header, Loading, Muted, Screen } from '@/components/ui';
import { colors } from '@/theme';

export default function ChatListScreen() {
  const { logout } = useAuth();
  const { ready, sessions, createChat, deleteSession } = useChatSessions();

  const openNew = () => {
    const id = createChat();
    router.push({ pathname: '/student/session/[id]', params: { id } });
  };

  return (
    <Screen>
      <Header kicker="Student" title="Chats" actionLabel="Log out" onAction={() => void logout()} />
      <Pressable accessibilityRole="button" style={styles.newChat} onPress={openNew}>
        <Text style={styles.newChatLabel}>New chat</Text>
      </Pressable>
      {!ready ? <Loading /> : null}
      <ScrollView contentContainerStyle={styles.list}>
        {sessions.map((session) => (
          <View key={session.id} style={styles.row}>
            <Pressable
              accessibilityRole="button"
              style={styles.rowMain}
              onPress={() => router.push({ pathname: '/student/session/[id]', params: { id: session.id } })}
            >
              <Text style={styles.rowTitle}>{session.title}</Text>
              <Muted>{session.messages.length} messages</Muted>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => deleteSession(session.id)} hitSlop={8}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  newChat: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  newChatLabel: { color: '#04221c', fontWeight: '700' },
  list: { gap: 10, paddingTop: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  rowMain: { flex: 1, gap: 4 },
  rowTitle: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  delete: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
