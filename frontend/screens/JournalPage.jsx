import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserNoteModal from '../components/JournalModal'; 
import { fetchNoteCategories } from '../api/noteCategories';
import { fetchJournals, updateJournal, deleteJournal, createJournal } from '../api/journalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JournalPreview from '../components/JournalPreview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 14,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    iconSize: {
      small: isTablet ? 20 : 16,
      medium: isTablet ? 24 : 20,
      large: isTablet ? 32 : 24,
    }
  };
};

// Professional color palette with your primary color
const COLORS = {
  primary: '#A07553',
  primaryLight: '#B8956D',
  primaryDark: '#8A6344',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    strong: '#B0B0B0',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  overlay: 'rgba(160, 117, 83, 0.1)',
};

// Enhanced color table for categories with better contrast
const CATEGORY_COLORS = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

const JournalApp = ({ navigation }) => {
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

  const dimensions = getResponsiveDimensions();

  // Function to get category color by ID or name
  const getCategoryColor = (categoryIdentifier) => {
    const categoryIndex = categories.findIndex(cat => 
      cat.id === categoryIdentifier || 
      cat.name === categoryIdentifier ||
      cat.id.toString() === categoryIdentifier?.toString()
    );
    return categoryIndex >= 0 ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : COLORS.primary;
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

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserId(parsedUser.id);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    initializeUser();
  }, []);

  // Load categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchNoteCategories();
        console.log('Loaded categories:', data);
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      }
    };
    getCategories();
  }, []);

  // Load journals
  useEffect(() => {
    const getJournals = async () => {
      if (!userId || categories.length === 0) return;
      
      try {
        setLoading(true);
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
        Alert.alert('Error', 'Failed to load journals');
      } finally {
        setLoading(false);
      }
    };

    getJournals();
  }, [userId, categories]);

  const handleSaveNote = async (noteData) => {
    try {
      setLoading(true);

      const apiData = {
        ...noteData,
        user_id: userId,
        note_categorie_id: noteData.note_categorie_id || noteData.category,
      };

      if (editingJournal) {
        // Update existing journal
        console.log('Updating journal:', editingJournal.id, apiData);
        
        const updatedJournal = await updateJournal(editingJournal.id, apiData);
        
        // Update local state
        setJournals(journals.map(journal => 
          journal.id === editingJournal.id 
            ? { 
                ...journal, 
                ...apiData, 
                category: getCategoryName(apiData.note_categorie_id || apiData.category) 
              } 
            : journal
        ));
        
        setEditingJournal(null);
        Alert.alert('Success', 'Journal updated successfully');
      } else {
        // Create new journal
        console.log('Creating new journal:', apiData);
        
        const newJournal = await createJournal(apiData);
        
        // Add to local state
        const processedJournal = {
          ...newJournal,
          category: getCategoryName(newJournal.note_categorie_id)
        };
        
        setJournals([processedJournal, ...journals]);
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

  // Handle journal preview
  const handleViewJournal = (journal) => {
    setSelectedJournal(journal);
    setPreviewVisible(true);
  };
  
  const handleEditJournal = (journal) => {
    console.log('Editing journal:', journal);
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
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Deleting journal:', journalId);
              
              await deleteJournal(journalId);
              
              // Remove from local state
              setJournals(journals.filter(journal => journal.id !== journalId));
              
              Alert.alert('Success', 'Journal deleted successfully');
            } catch (error) {
              console.error('Error deleting journal:', error);
              Alert.alert('Error', 'Failed to delete journal. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleAddNew = () => {
    setEditingJournal(null);
    setModalVisible(true);
  };

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Enhanced category filter handler
  const handleCategoryFilter = (categoryName) => {
    console.log('Filtering by category:', categoryName);
    setActiveCategory(categoryName);
  };

  // Enhanced filter journals based on active category and search query
  const filteredJournals = journals.filter(journal => {
    // Filter by category
    let categoryMatch = true;
    if (activeCategory !== 'All') {
      const journalCategoryName = getCategoryName(journal.category || journal.note_categorie_id);
      categoryMatch = journalCategoryName === activeCategory;
    }

    // Filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      searchMatch = 
        journal.title?.toLowerCase().includes(query) ||
        journal.content?.toLowerCase().includes(query) ||
        journal.verse?.toLowerCase().includes(query) ||
        getCategoryName(journal.category || journal.note_categorie_id)?.toLowerCase().includes(query);
    }

    return categoryMatch && searchMatch;
  });

  if (loading && journals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading journals...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>
              Processing...
            </Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
          My Journals
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerActionButton, showSearch && styles.headerActionButtonActive]} 
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons 
              name="search" 
              size={dimensions.iconSize.medium} 
              color={showSearch ? COLORS.background : COLORS.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={dimensions.iconSize.medium} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            <TextInput
              style={[styles.searchInput, { fontSize: dimensions.fontSize.body }]}
              placeholder="Search journals, titles, content..."
              placeholderTextColor={COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close" size={dimensions.iconSize.small} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeCategory === 'All' ? styles.activeFilter : styles.inactiveFilter
            ]}
            onPress={() => handleCategoryFilter('All')}
          >
            <Text style={[
              styles.filterText,
              { fontSize: dimensions.fontSize.caption },
              activeCategory === 'All' ? styles.activeFilterText : styles.inactiveFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id || cat.name}
              style={[
                styles.filterButton,
                activeCategory === cat.name ? styles.activeFilter : styles.inactiveFilter
              ]}
              onPress={() => handleCategoryFilter(cat.name)}
            >
              <View style={[
                styles.categoryDot, 
                { backgroundColor: getCategoryColor(cat.id || cat.name) }
              ]} />
              <Text style={[
                styles.filterText,
                { fontSize: dimensions.fontSize.caption },
                activeCategory === cat.name ? styles.activeFilterText : styles.inactiveFilterText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Results Info */}
        {(searchQuery.trim() || activeCategory !== 'All') && (
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { fontSize: dimensions.fontSize.caption }]}>
              {filteredJournals.length} result{filteredJournals.length !== 1 ? 's' : ''} 
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {activeCategory !== 'All' && ` in "${activeCategory}"`}
            </Text>
          </View>
        )}

        {/* Journal Entries */}
        <View style={styles.entriesContainer}>
          {filteredJournals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="journal-outline" size={64} color={COLORS.border.medium} />
              </View>
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                {searchQuery.trim() 
                  ? 'No matches found' 
                  : activeCategory === 'All' 
                    ? 'Start your journey' 
                    : 'No entries in this category'
                }
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                {searchQuery.trim() 
                  ? `No journals found matching "${searchQuery}"` 
                  : activeCategory === 'All' 
                    ? 'Create your first journal entry to begin documenting your thoughts and experiences.' 
                    : `No journals found in "${activeCategory}" category. Try a different category or create a new entry.`
                }
              </Text>
              {(searchQuery.trim() || activeCategory !== 'All') && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                >
                  <Text style={[styles.clearFiltersText, { fontSize: dimensions.fontSize.caption }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredJournals.map((journal) => {
              const journalCategoryName = getCategoryName(journal.category || journal.note_categorie_id);
              const categoryColor = getCategoryColor(journal.category || journal.note_categorie_id);
              
              return (
                <TouchableOpacity 
                  key={journal.id} 
                  style={[styles.entryCard, { borderLeftColor: categoryColor }]}
                  onPress={() => handleViewJournal(journal)}
                  activeOpacity={0.7}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.categoryContainer}>
                      <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
                      <Text style={[styles.categoryText, { fontSize: dimensions.fontSize.caption }]}>
                        {journalCategoryName}
                      </Text>
                    </View>
                    <Text style={[styles.entryDate, { fontSize: dimensions.fontSize.caption }]}>
                      {journal.date}
                    </Text>
                  </View>
                  
                  <Text style={[styles.entryTitle, { fontSize: dimensions.fontSize.subtitle }]} numberOfLines={2}>
                    {journal.title}
                  </Text>
                  
                  <Text style={[styles.entryContent, { fontSize: dimensions.fontSize.body }]} numberOfLines={3}>
                    {journal.content}
                  </Text>
                  
                  <View style={styles.entryFooter}>
                    <View style={styles.verseContainer}>
                      <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                      <Text style={[styles.verseText, { fontSize: dimensions.fontSize.caption }]} numberOfLines={1}>
                        {journal.verse}
                      </Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEditJournal(journal);
                        }}
                        disabled={loading}
                      >
                        <Ionicons name="create-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteJournal(journal.id);
                        }}
                        disabled={loading}
                      >
                        <Ionicons name="trash-outline" size={dimensions.iconSize.small} color={COLORS.semantic.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
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
      
      <JournalPreview
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        journal={selectedJournal}
        categories={categories}
        onEdit={(journal) => {
          setPreviewVisible(false);
          handleEditJournal(journal);
        }}
        onDelete={(journalId) => {
          setPreviewVisible(false);
          handleDeleteJournal(journalId);
        }}
      />
    </SafeAreaView>
  );
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.surfaceElevated,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerActionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: dimensions.spacing.sm,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border.light,
    borderRadius: 12,
    marginLeft: dimensions.spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  filterContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  filterContentContainer: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 20,
    marginRight: dimensions.spacing.sm,
    borderWidth: 1,
    minHeight: 36,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inactiveFilter: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border.medium,
  },
  filterText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeFilterText: {
    color: COLORS.background,
  },
  inactiveFilterText: {
    color: COLORS.text.secondary,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: dimensions.spacing.xs,
  },
  resultsInfo: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  resultsText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  entriesContainer: {
    padding: dimensions.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xl * 2,
    paddingHorizontal: dimensions.spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    marginBottom: dimensions.spacing.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  emptyTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: dimensions.spacing.lg,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 24,
  },
  clearFiltersText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: dimensions.cardPadding,
    marginBottom: dimensions.spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: dimensions.spacing.sm,
  },
  categoryText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryDate: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  entryTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    lineHeight: 24,
  },
  entryContent: {
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: dimensions.spacing.md,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDBBA1',
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
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEDED2',
    borderRadius: 18,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default JournalApp;