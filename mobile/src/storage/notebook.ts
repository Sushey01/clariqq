import AsyncStorage from '@react-native-async-storage/async-storage';

export const NOTEBOOK_STORAGE_KEY = 'clariq_student_notebook_v1';

export type StudentNote = {
  id: string;
  title: string;
  text: string;
  concept: string;
  createdAt: number;
};

const DEFAULT_NOTES: StudentNote[] = [
  {
    id: 'note-1',
    title: 'Buoyancy & Archimedes Principle Formula',
    text: 'Archimedes principle states that any object completely or partially submerged in a fluid experiences an upward buoyant force equal to the weight of the fluid displaced by the object. Upthrust (F) = V × ρ × g',
    concept: 'Physics - Hydrostatics',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'note-2',
    title: 'Modern Periodic Law Summary',
    text: 'Physical and chemical properties of elements are periodic functions of their atomic numbers, not atomic masses. Moseleys law resolved anomalies in Mendeleevs table like Argon-Potassium placement.',
    concept: 'Chemistry - Periodic Table',
    createdAt: Date.now() - 3600000 * 48,
  },
];

export async function getSavedNotes(): Promise<StudentNote[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTEBOOK_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

export async function saveNoteToNotebook(note: {
  title?: string;
  text: string;
  concept?: string;
}): Promise<boolean> {
  try {
    const current = await getSavedNotes();
    const exists = current.some((n) => n.text.trim() === note.text.trim());
    if (exists) return false;

    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      title: note.title?.trim() || 'Saved Socratic Takeaway',
      text: note.text.trim(),
      concept: note.concept?.trim() || 'Grade 10 Science',
      createdAt: Date.now(),
    };

    const updated = [newNote, ...current];
    await AsyncStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function deleteNote(id: string): Promise<StudentNote[]> {
  try {
    const current = await getSavedNotes();
    const updated = current.filter((note) => note.id !== id);
    await AsyncStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
