import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import UserNoteModal from '../components/JournalModal'; 
import { fetchNoteCategories } from '../api/noteCategories';
import { fetchJournals } from '../api/journalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Color table for category colors (same as in modal)
const COLOR_TABLE = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

const JournalApp = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [journals, setJournals] = useState([]);
  const [editingJournal, setEditingJournal] = useState(null);

  // Function to get category color by ID or name
  const getCategoryColor = (categoryIdentifier) => {
    const categoryIndex = categories.findIndex(cat => 
      cat.id === categoryIdentifier || 
      cat.name === categoryIdentifier ||
      cat.id.toString() === categoryIdentifier?.toString()
    );
    return categoryIndex >= 0 ? COLOR_TABLE[categoryIndex % COLOR_TABLE.length] : '#AE796D';
  };

  // Function to get category data by ID or name
  const getCategoryData = (categoryIdentifier) => {
    return categories.find(cat => 
      cat.id === categoryIdentifier || 
      cat.name === categoryIdentifier ||
      cat.id.toString() === categoryIdentifier?.toString()
    );
  };

  // Function to get category name from ID or return name if already a name
  const getCategoryName = (categoryIdentifier) => {
    const category = getCategoryData(categoryIdentifier);
    return category ? category.name : categoryIdentifier;
  };

  const handleSaveNote = (noteData) => {
    // Ensure we store the category name consistently
    const processedNoteData = {
      ...noteData,
      category: getCategoryName(noteData.category || noteData.note_categorie_id),
    };

    if (editingJournal) {
      // Update existing journal
      setJournals(journals.map(journal => 
        journal.id === editingJournal.id ? { ...journal, ...processedNoteData } : journal
      ));
      setEditingJournal(null);
    } else {
      // Add new journal
      setJournals([processedNoteData, ...journals]);
    }
    setModalVisible(false);
  };

  const handleEditJournal = (journal) => {
    setEditingJournal(journal);
    setModalVisible(true);
  };

  const handleDeleteJournal = (journalId) => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setJournals(journals.filter(journal => journal.id !== journalId));
          },
        },
      ],
    );
  };

  const handleAddNew = () => {
    setEditingJournal(null);
    setModalVisible(true);
  };

  // Enhanced category filter handler
  const handleCategoryFilter = (categoryName) => {
    console.log('Filtering by category:', categoryName);
    console.log('Available journals:', journals.map(j => ({ 
      id: j.id, 
      category: j.category,
      categoryName: getCategoryName(j.category || j.note_categorie_id)
    })));
    setActiveCategory(categoryName);
  };

  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchNoteCategories();
      console.log('Loaded categories:', data);
      setCategories(data);
    };
    getCategories();
  }, []);

  useEffect(() => {
    const getJournals = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) {
          console.warn('No user data found');
          return;
        }

        const parsedUser = JSON.parse(userData);
        const userId = parsedUser.id; 

        const data = await fetchJournals(userId);
        console.log('Loaded journals:', data);
        
        // Process journals to ensure consistent category naming
        const processedJournals = data.map(journal => ({
          ...journal,
          category: getCategoryName(journal.category || journal.note_categorie_id)
        }));
        
        setJournals(processedJournals);
      } catch (error) {
        console.error('Error loading journals:', error);
      }
    };

    // Only fetch journals after categories are loaded
    if (categories.length > 0) {
      getJournals();
    }
  }, [categories]);

  // Enhanced filter journals based on active category
  const filteredJournals = journals.filter(journal => {
    if (activeCategory === 'All') return true;
    
    // Get the journal's category name
    const journalCategoryName = getCategoryName(journal.category || journal.note_categorie_id);
    
    // Compare with active category
    return journalCategoryName === activeCategory;
  });

  console.log('Active category:', activeCategory);
  console.log('Filtered journals count:', filteredJournals.length);
  console.log('Filtered journals:', filteredJournals.map(j => ({ 
    id: j.id, 
    title: j.title,
    category: getCategoryName(j.category || j.note_categorie_id)
  })));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journals</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          <TouchableOpacity
            style={activeCategory === 'All' ? styles.activeFilter : styles.inactiveFilter}
            onPress={() => handleCategoryFilter('All')}
          >
            <Text style={activeCategory === 'All' ? styles.activeFilterText : styles.inactiveFilterText}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id || cat.name}
              style={activeCategory === cat.name ? styles.activeFilter : styles.inactiveFilter}
              onPress={() => handleCategoryFilter(cat.name)}
            >
              <Text style={activeCategory === cat.name ? styles.activeFilterText : styles.inactiveFilterText}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Journal Entries */}
        <View style={styles.entriesContainer}>
          {filteredJournals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeCategory === 'All' 
                  ? 'No journals found. Start writing your first entry!' 
                  : `No journals found in "${activeCategory}" category.`
                }
              </Text>
            </View>
          ) : (
            filteredJournals.map((journal) => {
              const journalCategoryName = getCategoryName(journal.category || journal.note_categorie_id);
              const categoryColor = getCategoryColor(journal.category || journal.note_categorie_id);
              
              return (
                <View key={journal.id} style={[styles.entryCard, { borderLeftColor: categoryColor }]}>
                  <View style={styles.entryHeader}>
                    <View style={styles.categoryContainer}>
                      <Text style={styles.categoryIcon}>📝</Text>
                      <Text style={styles.categoryText}>{journalCategoryName}</Text>
                    </View>
                    <Text style={styles.entryDate}>{journal.date}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{journal.title}</Text>
                  <Text style={styles.entryContent}>{journal.content}</Text>
                  <View style={styles.entryFooter}>
                    <View style={styles.verseContainer}>
                      <Text style={styles.verseIcon}>📖</Text>
                      <Text style={styles.verseText}>{journal.verse}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditJournal(journal)}
                      >
                        <Text style={styles.actionButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteJournal(journal.id)}
                      >
                        <Text style={styles.actionButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
      
      <UserNoteModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingJournal(null);
        }}
        onSave={handleSaveNote}
        onAuthRequired={() => setShowAuthModal(true)}
        initialNote={editingJournal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#AE796D',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: '#AE796D',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  activeFilter: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveFilter: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  inactiveFilterText: {
    color: '#A07553',
    fontSize: 14,
    fontWeight: '500',
  },
  entriesContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A07553',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  entryContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AE796D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  verseIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  verseText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default JournalApp;