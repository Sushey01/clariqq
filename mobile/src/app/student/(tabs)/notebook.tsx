import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Badge, Button, Header, Loading, ModalView, Screen } from '@/components/ui';
import {
  deleteNote,
  getSavedNotes,
  saveNoteToNotebook,
  type StudentNote,
} from '@/storage/notebook';
import { colors } from '@/theme';

export default function StudentNotebookScreen() {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newConcept, setNewConcept] = useState('Physics');
  const [newText, setNewText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedNotes();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCopy = async (note: StudentNote) => {
    await Clipboard.setStringAsync(`${note.title}\n${note.text}`);
    setCopiedId(note.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Note', `Remove "${title}" from your notebook?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteNote(id);
          setNotes(updated);
        },
      },
    ]);
  };

  const handleAddCustom = async () => {
    if (!newText.trim()) return;
    await saveNoteToNotebook({
      title: newTitle.trim() || 'Study Note',
      text: newText.trim(),
      concept: newConcept.trim() || 'Science',
    });
    setNewTitle('');
    setNewText('');
    setModalOpen(false);
    void load();
  };

  const filteredNotes = notes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.text.toLowerCase().includes(q) ||
      n.concept.toLowerCase().includes(q)
    );
  });

  return (
    <Screen>
      <Header
        kicker="Study Reference"
        title="Student Notebook"
        actionLabel="Add Note"
        actionIcon="add"
        onAction={() => setModalOpen(true)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.faint} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search saved formulas & definitions…"
            placeholderTextColor={colors.faint}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {loading ? <Loading label="Opening notebook…" /> : null}

        {/* Empty state */}
        {!loading && filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="book-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>Notebook is empty</Text>
            <Text style={styles.emptyLead}>
              Save formulas and key tutor explanations during Socratic chats by tapping the notebook
              icon.
            </Text>
            <Button
              label="Add First Note"
              icon="create-outline"
              onPress={() => setModalOpen(true)}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : null}

        {/* Notes list */}
        <View style={styles.list}>
          {filteredNotes.map((note) => {
            const isCopied = copiedId === note.id;
            return (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteTop}>
                  <Badge label={note.concept} variant="cyan" />
                  <View style={styles.noteActions}>
                    <Pressable
                      onPress={() => void handleCopy(note)}
                      hitSlop={8}
                      style={[styles.actionBtn, isCopied && styles.actionBtnActive]}
                    >
                      <Ionicons
                        name={isCopied ? 'checkmark' : 'copy-outline'}
                        size={15}
                        color={isCopied ? colors.accentEmerald : colors.accent}
                      />
                      <Text
                        style={[
                          styles.actionLabel,
                          isCopied && { color: colors.accentEmerald },
                        ]}
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(note.id, note.title)}
                      hitSlop={8}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Custom Note Modal */}
      <ModalView visible={modalOpen} onClose={() => setModalOpen(false)} title="Add Study Note">
        <View style={styles.modalBody}>
          <Text style={styles.modalFieldLabel}>Concept / Subject</Text>
          <View style={styles.subjectRow}>
            {['Physics', 'Chemistry', 'Biology', 'Earth'].map((subj) => (
              <Pressable
                key={subj}
                onPress={() => setNewConcept(subj)}
                style={[
                  styles.subjectPill,
                  newConcept === subj && styles.subjectPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.subjectPillText,
                    newConcept === subj && styles.subjectPillTextActive,
                  ]}
                >
                  {subj}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.modalFieldLabel}>Title</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g., Pascal's Law Formula"
            placeholderTextColor={colors.faint}
            style={styles.modalInput}
          />

          <Text style={styles.modalFieldLabel}>Note Content / Formula</Text>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder="Write key explanation, principle, or formula…"
            placeholderTextColor={colors.faint}
            style={[styles.modalInput, styles.modalTextarea]}
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              tone="ghost"
              onPress={() => setModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              label="Save Note"
              disabled={!newText.trim()}
              onPress={() => void handleAddCustom()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ModalView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 14, paddingTop: 4, paddingBottom: 32 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 13 },

  list: { gap: 12 },
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    gap: 10,
  },
  noteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 4 },
  actionBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: 6 },
  actionLabel: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  noteTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  noteText: { color: colors.inkSecondary, fontSize: 14, lineHeight: 21 },

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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  emptyLead: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },

  modalBody: { gap: 10 },
  modalFieldLabel: { color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  subjectRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  subjectPillActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  subjectPillText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  subjectPillTextActive: { color: colors.accent },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalTextarea: { height: 90, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
