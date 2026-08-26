import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchJournals, createJournal, updateJournal, deleteJournal } from '../api/journalApi';

// ── check-in notification (one combined reminder, not per-application) ──
const CHECKIN_NOTIF_KEY = 'checkinNotifId';

async function cancelCheckInNotification() {
  if (Platform.OS === 'web') return;
  try {
    const id = await AsyncStorage.getItem(CHECKIN_NOTIF_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(CHECKIN_NOTIF_KEY);
    }
  } catch (e) {}
}

async function scheduleCheckInNotification(applications) {
  if (Platform.OS === 'web') return;
  try {
    await cancelCheckInNotification();

    const hasActive = applications.some((note) => (note.progress_percent ?? 0) < 100);
    if (!hasActive) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: s } = await Notifications.requestPermissionsAsync();
      if (s !== 'granted') return;
    }

    const now = new Date();
    const fireDate = new Date(now);
    fireDate.setHours(9, 0, 0, 0);
    if (fireDate <= now) fireDate.setDate(fireDate.getDate() + 1);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Check-in time',
        body: 'How are your applications going? Tap to check in.',
        sound: true,
        data: { type: 'checkin' },
      },
      trigger: { date: fireDate },
    });
    await AsyncStorage.setItem(CHECKIN_NOTIF_KEY, id);
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────

export default function useJournal() {
  const [activeSection, setActiveSection] = useState('journey');
  const [journals, setJournals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [journeyModalVisible, setJourneyModalVisible] = useState(false);
  const [appModalVisible, setAppModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (raw) setUserId(JSON.parse(raw).id);
    });
  }, []);

  const loadJournals = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    fetchJournals(userId)
      .then((data) => { setJournals(data); setLoadError(false); })
      .catch(() => setLoadError(true))
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
      soap_scripture: data.verse || '',
      date: new Date().toISOString().split('T')[0],
      progress_percent: data.percent ?? 0,
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
      await scheduleCheckInNotification(allApps);
    } catch (e) {
      Alert.alert('Error', 'Failed to save application.');
    } finally {
      setLoading(false);
    }
  };

  // ── update application progress ───────────────────────────────
  const updateApplicationProgress = async (note, percent) => {
    try {
      await updateJournal(note.id, {
        title: note.title,
        content: note.content || '',
        soap_scripture: note.soap_scripture || '',
        date: note.date,
        note_categorie_name: 'Application',
        progress_percent: percent,
      });

      const newJournals = journals.map((j) => j.id === note.id ? { ...j, progress_percent: percent } : j);
      setJournals(newJournals);
      const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
      await scheduleCheckInNotification(allApps);
      return newJournals;
    } catch (e) {
      Alert.alert('Error', 'Failed to update progress.');
      return journals;
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
        progress_percent: 0,
      };
      const created = await createJournal(payload);
      const newJournals = [{ ...created, note_categorie_name: 'Application' }, ...journals];
      setJournals(newJournals);
      const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
      await scheduleCheckInNotification(allApps);
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
            const newJournals = journals.filter((j) => j.id !== noteId);
            setJournals(newJournals);
            const allApps = newJournals.filter((j) => j.note_categorie_name === 'Application');
            await scheduleCheckInNotification(allApps);
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
    loadError,
    retryLoad: loadJournals,
    journeyModalVisible, setJourneyModalVisible,
    appModalVisible, setAppModalVisible,
    wishlistModalVisible, setWishlistModalVisible,
    editingNote, setEditingNote,
    saveJourney,
    saveApplication,
    updateApplicationProgress,
    saveWishlist,
    markWishlistAnswered,
    saveApplicationFromWishlist,
    handleDelete,
    openAdd,
    openEdit,
  };
}
