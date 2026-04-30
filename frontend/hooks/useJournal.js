import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchNoteCategories, createNoteCategory, fetchJournals, createJournal, updateJournal, deleteJournal } from '../api/journalApi';

// ── notification helpers ──────────────────────────────────────────
async function scheduleAppReminder(noteId, actionText) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: s } = await Notifications.requestPermissionsAsync();
      if (s !== 'granted') return;
    }
    const existing = await AsyncStorage.getItem(`appNotif_${noteId}`);
    if (existing) {
      await Notifications.cancelScheduledNotificationAsync(existing).catch(() => {});
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Daily Check-in',
        body: `Did you do: "${actionText}"?`,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
    });
    await AsyncStorage.setItem(`appNotif_${noteId}`, id);
  } catch (e) {
    console.error('scheduleAppReminder error', e);
  }
}

async function cancelAppReminder(noteId) {
  try {
    const id = await AsyncStorage.getItem(`appNotif_${noteId}`);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(`appNotif_${noteId}`);
    }
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────

export default function useJournal() {
  const [activeSection, setActiveSection] = useState('journey');
  const [catIds, setCatIds] = useState({ journey: null, application: null, wishlist: null });
  const [journals, setJournals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal / form state
  const [journeyModalVisible, setJourneyModalVisible] = useState(false);
  const [appModalVisible, setAppModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);

  // ── init ──────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (raw) setUserId(JSON.parse(raw).id);
    });
  }, []);

  useEffect(() => {
    const ensureCategories = async () => {
      try {
        let cats = await fetchNoteCategories();
        const required = ['Journey', 'Application', 'Wishlist'];
        for (const name of required) {
          if (!cats.find((c) => c.name === name)) {
            const created = await createNoteCategory(name);
            if (created) cats = [...cats, created];
          }
        }
        const find = (name) => cats.find((c) => c.name === name)?.id ?? null;
        setCatIds({ journey: find('Journey'), application: find('Application'), wishlist: find('Wishlist') });
      } catch (e) {}
    };
    ensureCategories();
  }, []);

  const loadJournals = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    fetchJournals(userId)
      .then(setJournals)
      .catch(() => Alert.alert('Error', 'Failed to load journal entries'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { loadJournals(); }, [loadJournals]);

  // ── derived lists per section ─────────────────────────────────
  const journeys = journals.filter((j) => j.note_categorie_name === 'Journey');
  const applications = journals.filter((j) => j.note_categorie_name === 'Application');
  const wishlists = journals.filter((j) => j.note_categorie_name === 'Wishlist');

  // ── save journey (SOAP) ───────────────────────────────────────
  const saveJourney = async (data) => {
    const catId = catIds.journey;
    if (!catId) { Alert.alert('Error', 'Journey category not found. Run the seeder.'); return; }
    const payload = {
      user_id: userId,
      note_categorie_id: catId,
      title: data.title || 'Journey Entry',
      content: '',
      date: new Date().toISOString().split('T')[0],
      soap_scripture: data.scripture,
      soap_observation: data.observation,
      soap_application: data.application,
      soap_prayer: data.prayer,
    };
    try {
      setLoading(true);
      if (editingNote) {
        await updateJournal(editingNote.id, { ...payload, user_id: undefined });
        setJournals((prev) => prev.map((j) => j.id === editingNote.id ? { ...j, ...payload, note_categorie_name: 'Journey' } : j));
      } else {
        const created = await createJournal(payload);
        setJournals((prev) => [{ ...created, note_categorie_name: 'Journey' }, ...prev]);
      }
      setJourneyModalVisible(false);
      setEditingNote(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save journey entry.');
    } finally {
      setLoading(false);
    }
  };

  // ── save application ──────────────────────────────────────────
  const saveApplication = async (data) => {
    const catId = catIds.application;
    if (!catId) { Alert.alert('Error', 'Application category not found.'); return; }
    const payload = {
      user_id: userId,
      note_categorie_id: catId,
      title: data.title,
      content: data.notes || '',
      date: new Date().toISOString().split('T')[0],
      status: 'not_started',
    };
    try {
      setLoading(true);
      if (editingNote) {
        await updateJournal(editingNote.id, { ...payload, user_id: undefined });
        setJournals((prev) => prev.map((j) => j.id === editingNote.id ? { ...j, ...payload, note_categorie_name: 'Application' } : j));
        if (['not_started', 'in_progress'].includes(payload.status)) {
          await scheduleAppReminder(editingNote.id, payload.title);
        }
      } else {
        const created = await createJournal(payload);
        const entry = { ...created, note_categorie_name: 'Application' };
        setJournals((prev) => [entry, ...prev]);
        await scheduleAppReminder(created.id, payload.title);
      }
      setAppModalVisible(false);
      setEditingNote(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save application.');
    } finally {
      setLoading(false);
    }
  };

  // ── update application status ─────────────────────────────────
  const updateApplicationStatus = async (note, newStatus) => {
    try {
      await updateJournal(note.id, {
        title: note.title,
        content: note.content || '',
        date: note.date,
        note_categorie_id: catIds.application,
        status: newStatus,
      });
      setJournals((prev) => prev.map((j) => j.id === note.id ? { ...j, status: newStatus } : j));
      if (newStatus === 'completed') {
        await cancelAppReminder(note.id);
      } else {
        await scheduleAppReminder(note.id, note.title);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  // ── save wishlist ─────────────────────────────────────────────
  const saveWishlist = async (data) => {
    const catId = catIds.wishlist;
    if (!catId) { Alert.alert('Error', 'Wishlist category not found.'); return; }
    const payload = {
      user_id: userId,
      note_categorie_id: catId,
      title: data.title,
      content: data.content || '',
      date: new Date().toISOString().split('T')[0],
      is_answered: false,
    };
    try {
      setLoading(true);
      if (editingNote) {
        await updateJournal(editingNote.id, { ...payload, user_id: undefined });
        setJournals((prev) => prev.map((j) => j.id === editingNote.id ? { ...j, ...payload, note_categorie_name: 'Wishlist' } : j));
      } else {
        const created = await createJournal(payload);
        setJournals((prev) => [{ ...created, note_categorie_name: 'Wishlist' }, ...prev]);
      }
      setWishlistModalVisible(false);
      setEditingNote(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save wishlist entry.');
    } finally {
      setLoading(false);
    }
  };

  // ── mark wishlist as answered ─────────────────────────────────
  const markWishlistAnswered = async (note, reason) => {
    try {
      await updateJournal(note.id, {
        title: note.title,
        content: note.content || '',
        date: note.date,
        note_categorie_id: catIds.wishlist,
        is_answered: true,
        answer_reason: reason,
      });
      setJournals((prev) => prev.map((j) => j.id === note.id ? { ...j, is_answered: true, answer_reason: reason } : j));
    } catch (e) {
      Alert.alert('Error', 'Failed to mark as answered.');
    }
  };

  // ── save application from wishlist answer ─────────────────────
  const saveApplicationFromWishlist = async (actionText) => {
    const catId = catIds.application;
    if (!catId) return;
    try {
      const payload = {
        user_id: userId,
        note_categorie_id: catId,
        title: actionText,
        content: '',
        date: new Date().toISOString().split('T')[0],
        status: 'not_started',
      };
      const created = await createJournal(payload);
      setJournals((prev) => [{ ...created, note_categorie_name: 'Application' }, ...prev]);
      await scheduleAppReminder(created.id, actionText);
    } catch (e) {
      Alert.alert('Error', 'Failed to save application.');
    }
  };

  // ── delete any note ───────────────────────────────────────────
  const handleDelete = (noteId) => {
    Alert.alert('Delete', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await deleteJournal(noteId);
            await cancelAppReminder(noteId);
            setJournals((prev) => prev.filter((j) => j.id !== noteId));
          } catch {
            Alert.alert('Error', 'Failed to delete entry.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ── open modals ───────────────────────────────────────────────
  const openAdd = () => {
    setEditingNote(null);
    if (activeSection === 'journey') setJourneyModalVisible(true);
    else if (activeSection === 'application') setAppModalVisible(true);
    else setWishlistModalVisible(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    const name = note.note_categorie_name;
    if (name === 'Journey') setJourneyModalVisible(true);
    else if (name === 'Application') setAppModalVisible(true);
    else setWishlistModalVisible(true);
  };

  return {
    activeSection, setActiveSection,
    journeys, applications, wishlists,
    loading,
    journeyModalVisible, setJourneyModalVisible,
    appModalVisible, setAppModalVisible,
    wishlistModalVisible, setWishlistModalVisible,
    editingNote, setEditingNote,
    previewNote, setPreviewNote,
    saveJourney,
    saveApplication,
    updateApplicationStatus,
    saveWishlist,
    markWishlistAnswered,
    saveApplicationFromWishlist,
    handleDelete,
    openAdd,
    openEdit,
  };
}
