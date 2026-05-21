import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchJournals, createJournal, updateJournal, deleteJournal } from '../api/journalApi';

// ── cancel one notification ───────────────────────────────────────
async function cancelAppNotif(noteId) {
  if (Platform.OS === 'web') return;
  try {
    const id = await AsyncStorage.getItem(`appNotif_${noteId}`);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(`appNotif_${noteId}`);
    }
  } catch (e) {}
}

// ── rebuild the full one-per-day notification schedule ────────────
async function rescheduleAllAppNotifications(applications) {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: s } = await Notifications.requestPermissionsAsync();
      if (s !== 'granted') return;
    }

    // Cancel all existing app notifications
    for (const note of applications) {
      const existingId = await AsyncStorage.getItem(`appNotif_${note.id}`);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
        await AsyncStorage.removeItem(`appNotif_${note.id}`);
      }
    }

    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    // If already past 9 AM, earliest slot is tomorrow
    const earliestSlot = new Date(todayMidnight);
    if (now.getHours() >= 9) earliestSlot.setDate(earliestSlot.getDate() + 1);

    // Build due items list
    const dueItems = [];
    for (const note of applications) {
      const noteStatus = note.status || 'not_started';
      if (noteStatus === 'completed') continue;

      let dueDate = new Date(earliestSlot);
      let isRecheck = false;

      if (noteStatus === 'in_progress') {
        isRecheck = true;
        const since = await AsyncStorage.getItem(`appInProgressDate_${note.id}`);
        if (since) {
          const recheckDate = new Date(since);
          recheckDate.setDate(recheckDate.getDate() + 14);
          recheckDate.setHours(0, 0, 0, 0);
          dueDate = recheckDate > earliestSlot ? recheckDate : new Date(earliestSlot);
        }
      }

      dueItems.push({ note, dueDate, isRecheck });
    }

    // Sort by due date — earliest first
    dueItems.sort((a, b) => a.dueDate - b.dueDate);

    // Assign one slot per day
    const usedDays = new Set();
    for (const item of dueItems) {
      let slotDate = new Date(item.dueDate);
      slotDate.setHours(0, 0, 0, 0);

      let dayKey = slotDate.toISOString().split('T')[0];
      while (usedDays.has(dayKey)) {
        slotDate.setDate(slotDate.getDate() + 1);
        dayKey = slotDate.toISOString().split('T')[0];
      }
      usedDays.add(dayKey);

      const fireDate = new Date(slotDate);
      fireDate.setHours(9, 0, 0, 0);

      if (fireDate <= now) continue;

      const title = item.isRecheck ? '🔄 2-Week Check-in' : '✅ Daily Check-in';
      const body = item.isRecheck
        ? `Have you completed: "${item.note.title}"?`
        : `Did you do: "${item.note.title}"?`;

      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: { date: fireDate },
      });
      await AsyncStorage.setItem(`appNotif_${item.note.id}`, id);
    }
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────

export default function useJournal() {
  const [activeSection, setActiveSection] = useState('journey');
  const [journals, setJournals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [journeyModalVisible, setJourneyModalVisible] = useState(false);
  const [appModalVisible, setAppModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (raw) setUserId(JSON.parse(raw).id);
    });
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

  const journeys     = journals.filter((j) => j.note_categorie_name === 'Journey');
  const applications = journals.filter((j) => j.note_categorie_name === 'Application');
  const wishlists    = journals.filter((j) => j.note_categorie_name === 'Wishlist');

  // ── save journey (SOAP) ───────────────────────────────────────
  const saveJourney = async (data) => {
    const payload = {
      user_id: userId,
      note_categorie_name: 'Journey',
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
    const payload = {
      user_id: userId,
      note_categorie_name: 'Application',
      title: data.title,
      content: data.notes || '',
      date: new Date().toISOString().split('T')[0],
      status: 'not_started',
    };
    try {
      setLoading(true);
      let newJournals;
      if (editingNote) {
        await updateJournal(editingNote.id, { ...payload, user_id: undefined });
        newJournals = journals.map((j) => j.id === editingNote.id ? { ...j, ...payload, note_categorie_name: 'Application' } : j);
      } else {
        const created = await createJournal(payload);
        newJournals = [{ ...created, note_categorie_name: 'Application' }, ...journals];
      }
      setJournals(newJournals);
      setAppModalVisible(false);
      setEditingNote(null);
      const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
      await rescheduleAllAppNotifications(allApps);
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
        note_categorie_name: 'Application',
        status: newStatus,
      });

      // Track when note was set to in_progress
      if (newStatus === 'in_progress') {
        await AsyncStorage.setItem(`appInProgressDate_${note.id}`, new Date().toISOString().split('T')[0]);
      } else {
        await AsyncStorage.removeItem(`appInProgressDate_${note.id}`);
      }

      const newJournals = journals.map((j) => j.id === note.id ? { ...j, status: newStatus } : j);
      setJournals(newJournals);
      const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
      await rescheduleAllAppNotifications(allApps);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  // ── save wishlist ─────────────────────────────────────────────
  const saveWishlist = async (data) => {
    const payload = {
      user_id: userId,
      note_categorie_name: 'Wishlist',
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
  const markWishlistAnswered = async (note, reason, answeredDate) => {
    try {
      await updateJournal(note.id, {
        title: note.title,
        content: note.content || '',
        date: note.date,
        note_categorie_name: 'Wishlist',
        is_answered: true,
        answer_reason: reason || '',
        answered_date: answeredDate,
      });
      setJournals((prev) => prev.map((j) => j.id === note.id ? { ...j, is_answered: true, answer_reason: reason, answered_date: answeredDate } : j));
    } catch (e) {
      Alert.alert('Error', 'Failed to mark as answered.');
    }
  };

  // ── save application from wishlist/journey ────────────────────
  const saveApplicationFromWishlist = async (actionText) => {
    try {
      const payload = {
        user_id: userId,
        note_categorie_name: 'Application',
        title: actionText,
        content: '',
        date: new Date().toISOString().split('T')[0],
        status: 'not_started',
      };
      const created = await createJournal(payload);
      const newJournals = [{ ...created, note_categorie_name: 'Application' }, ...journals];
      setJournals(newJournals);
      const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
      await rescheduleAllAppNotifications(allApps);
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
            await cancelAppNotif(noteId);
            await AsyncStorage.removeItem(`appInProgressDate_${noteId}`);
            const newJournals = journals.filter((j) => j.id !== noteId);
            setJournals(newJournals);
            const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
            await rescheduleAllAppNotifications(allApps);
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
