import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNoteCategories } from '../api/noteCategories';
import { fetchJournals, updateJournal, deleteJournal, createJournal } from '../api/journalApi';
import { COLORS, CATEGORY_COLORS } from '../styles/JournalPage.styles';

function matchCategory(cat, identifier) {
  return cat.id === identifier || cat.name === identifier || cat.id?.toString() === identifier?.toString();
}

export default function useJournal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [journals, setJournals] = useState([]);
  const [editingJournal, setEditingJournal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);

  const getCategoryData = (identifier) => categories.find((cat) => matchCategory(cat, identifier));
  const getCategoryName = (identifier) => {
    const c = getCategoryData(identifier);
    return c ? c.name : identifier;
  };
  const getCategoryColor = (identifier) => {
    const i = categories.findIndex((cat) => matchCategory(cat, identifier));
    return i >= 0 ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : COLORS.primary;
  };

  useEffect(() => {
    AsyncStorage.getItem('user').then((userData) => {
      if (userData) setUserId(JSON.parse(userData).id);
    }).catch((e) => console.error('Error getting user data:', e));
  }, []);

  useEffect(() => {
    fetchNoteCategories().then(setCategories).catch((e) => {
      console.error('Error loading categories:', e);
      Alert.alert('Error', 'Failed to load categories');
    });
  }, []);

  useEffect(() => {
    if (!userId || categories.length === 0) return;
    setLoading(true);
    fetchJournals(userId)
      .then((data) => setJournals(data.map((j) => ({ ...j, category: getCategoryName(j.category || j.note_categorie_id) }))))
      .catch((e) => {
        console.error('Error loading journals:', e);
        Alert.alert('Error', 'Failed to load journals');
      })
      .finally(() => setLoading(false));
  }, [userId, categories]);

  const filteredJournals = journals.filter((journal) => {
    const categoryMatch = activeCategory === 'All' || getCategoryName(journal.category || journal.note_categorie_id) === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      journal.title?.toLowerCase().includes(q) ||
      journal.content?.toLowerCase().includes(q) ||
      journal.verse?.toLowerCase().includes(q) ||
      getCategoryName(journal.category || journal.note_categorie_id)?.toLowerCase().includes(q);
    return categoryMatch && searchMatch;
  });

  const handleSaveNote = async (noteData) => {
    try {
      setLoading(true);
      const apiData = { ...noteData, user_id: userId, note_categorie_id: noteData.note_categorie_id || noteData.category };
      if (editingJournal) {
        await updateJournal(editingJournal.id, apiData);
        setJournals((prev) =>
          prev.map((j) => (j.id === editingJournal.id ? { ...j, ...apiData, category: getCategoryName(apiData.note_categorie_id || apiData.category) } : j))
        );
        setEditingJournal(null);
        Alert.alert('Success', 'Journal updated successfully');
      } else {
        const newJournal = await createJournal(apiData);
        setJournals((prev) => [{ ...newJournal, category: getCategoryName(newJournal.note_categorie_id) }, ...prev]);
        Alert.alert('Success', 'Journal created successfully');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save journal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJournal = (journal) => {
    setSelectedJournal(journal);
    setPreviewVisible(true);
  };

  const handleEditJournal = (journal) => {
    setEditingJournal(journal);
    setModalVisible(true);
  };

  const handleDeleteJournal = (journalId) => {
    Alert.alert('Delete Journal', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await deleteJournal(journalId);
            setJournals((prev) => prev.filter((j) => j.id !== journalId));
            Alert.alert('Success', 'Journal deleted successfully');
          } catch (error) {
            console.error('Error deleting journal:', error);
            Alert.alert('Error', 'Failed to delete journal. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingJournal(null);
    setModalVisible(true);
  };

  return {
    modalVisible,
    setModalVisible,
    setEditingJournal,
    categories,
    activeCategory,
    setActiveCategory,
    journals,
    loading,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    previewVisible,
    setPreviewVisible,
    selectedJournal,
    editingJournal,
    getCategoryName,
    getCategoryColor,
    filteredJournals,
    handleSaveNote,
    handleViewJournal,
    handleEditJournal,
    handleDeleteJournal,
    openAddModal,
  };
}
