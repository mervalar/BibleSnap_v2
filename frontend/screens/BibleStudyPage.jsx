import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCategories } from '../api/categoryService';
import { fetchStarks } from '../api/starksService';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions (matching Journal app)
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

// Professional color palette (matching Journal app)
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

// Enhanced color table for categories
const CATEGORY_COLORS = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

const BibleStudyApp = () => {
  const navigation = useNavigation();
  const dimensions = getResponsiveDimensions();
  
  const [categories, setCategories] = useState([]);
  const [starks, setStarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [progressMap, setProgressMap] = useState({}); 
  const [openedStarks, setOpenedStarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to get category color by ID
  const getCategoryColor = (categoryId) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    return categoryIndex >= 0 ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : COLORS.primary;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedCategories, fetchedStarks] = await Promise.all([
          fetchCategories(),
          fetchStarks()
        ]);
        setCategories(fetchedCategories);
        setStarks(fetchedStarks);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load progress from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('bibleProgress').then(data => {
      if (data) setProgressMap(JSON.parse(data));
    });
  }, []);

  // Save progress to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
  }, [progressMap]);

  // Load opened starks from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('openedStarks').then(data => {
      if (data) setOpenedStarks(JSON.parse(data));
    });
  }, []);

  // Save opened starks to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('openedStarks', JSON.stringify(openedStarks));
  }, [openedStarks]);

  // Filter starks based on category and search query
  const filteredStarks = starks.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      (item.category && item.category.id === selectedCategory);
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const recentStarks = starks
    .filter(item => openedStarks.includes(item.id))
    .slice(-3)
    .reverse();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (loading && starks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading Bible studies...
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
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
          Bible Studies
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
          <TouchableOpacity style={styles.addButton}>
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
              placeholder="Search studies, titles, verses..."
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
              selectedCategory === 'all' ? styles.activeFilter : styles.inactiveFilter
            ]}
            onPress={() => handleCategoryFilter('all')}
          >
            <Text style={[
              styles.filterText,
              { fontSize: dimensions.fontSize.caption },
              selectedCategory === 'all' ? styles.activeFilterText : styles.inactiveFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterButton,
                selectedCategory === cat.id ? styles.activeFilter : styles.inactiveFilter
              ]}
              onPress={() => handleCategoryFilter(cat.id)}
            >
              <View style={[
                styles.categoryDot, 
                { backgroundColor: getCategoryColor(cat.id) }
              ]} />
              <Text style={[
                styles.filterText,
                { fontSize: dimensions.fontSize.caption },
                selectedCategory === cat.id ? styles.activeFilterText : styles.inactiveFilterText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Results Info */}
        {(searchQuery.trim() || selectedCategory !== 'all') && (
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { fontSize: dimensions.fontSize.caption }]}>
              {filteredStarks.length} result{filteredStarks.length !== 1 ? 's' : ''} 
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in "${categories.find(c => c.id === selectedCategory)?.name}"`}
            </Text>
          </View>
        )}

        {/* Bible Studies Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
            Bible Studies
          </Text>
          <Text style={[styles.studyCount, { fontSize: dimensions.fontSize.caption }]}>
            {filteredStarks.length} studies
          </Text>
        </View>

        {/* Bible Study Entries */}
        <View style={styles.entriesContainer}>
          {filteredStarks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="book-outline" size={64} color={COLORS.border.medium} />
              </View>
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                {searchQuery.trim() 
                  ? 'No matches found' 
                  : selectedCategory === 'all' 
                    ? 'Start your study' 
                    : 'No studies in this category'
                }
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                {searchQuery.trim() 
                  ? `No studies found matching "${searchQuery}"` 
                  : selectedCategory === 'all' 
                    ? 'Begin your journey with Bible studies to deepen your understanding and faith.' 
                    : `No studies found in "${categories.find(c => c.id === selectedCategory)?.name}" category. Try a different category or explore all studies.`
                }
              </Text>
              {(searchQuery.trim() || selectedCategory !== 'all') && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <Text style={[styles.clearFiltersText, { fontSize: dimensions.fontSize.caption }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredStarks.map((item) => {
              const categoryColor = getCategoryColor(item.category?.id);
              const progress = progressMap[item.id] || 0;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.entryCard, { borderLeftColor: categoryColor }]}
                  onPress={() => {
                    if (!openedStarks.includes(item.id)) {
                      setOpenedStarks(prev => [...prev, item.id]);
                    }
                    navigation.navigate('BibleStudyContent', {
                      stark: item,
                      onProgressUpdate: (percent) => {
                        setProgressMap((prev) => ({ ...prev, [item.id]: percent }));
                      }
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.categoryContainer}>
                      <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
                      <Text style={[styles.categoryText, { fontSize: dimensions.fontSize.caption }]}>
                        {item.category?.name || 'STUDY'}
                      </Text>
                    </View>
                    <Text style={[styles.entryDate, { fontSize: dimensions.fontSize.caption }]}>
                      {item.date || 'Today'}
                    </Text>
                  </View>
                  
                  <Text style={[styles.entryTitle, { fontSize: dimensions.fontSize.subtitle }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  {item.main_verse && (
                    <View style={styles.verseContainer}>
                      <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                      <Text style={[styles.verseText, { fontSize: dimensions.fontSize.caption }]} numberOfLines={2}>
                        {item.main_verse}
                      </Text>
                    </View>
                  )}

                  <View style={styles.entryFooter}>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { fontSize: dimensions.fontSize.caption }]}>
                        {progress}%
                      </Text>
                    </View>
                   
                  
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
              {/* Continue Reading Section */}
        {recentStarks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Continue Reading
              </Text>
              <Text style={[styles.studyCount, { fontSize: dimensions.fontSize.caption }]}>
                {recentStarks.length} recent
              </Text>
            </View>
            
            <View style={styles.entriesContainer}>
              {recentStarks.map((item) => {
                const categoryColor = getCategoryColor(item.category?.id);
                const progress = progressMap[item.id] || 0;
                
                return (
                  <TouchableOpacity
                    key={`recent-${item.id}`}
                    style={[styles.entryCard, styles.recentCard, { borderLeftColor: categoryColor }]}
                    onPress={() => {
                      navigation.navigate('BibleStudyContent', {
                        stark: item,
                        progress: progress,
                        onProgressUpdate: (percent) => {
                          setProgressMap((prev) => ({ ...prev, [item.id]: percent }));
                        }
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.entryHeader}>
                      <View style={styles.categoryContainer}>
                        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
                        <Text style={[styles.categoryText, { fontSize: dimensions.fontSize.caption }]}>
                          CONTINUE
                        </Text>
                      </View>
                      <Text style={[styles.progressText, { fontSize: dimensions.fontSize.caption }]}>
                        {progress}%
                      </Text>
                    </View>
                    
                    <Text style={[styles.entryTitle, { fontSize: dimensions.fontSize.subtitle }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    
                    {item.main_verse && (
                      <View style={styles.verseContainer}>
                        <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                        <Text style={[styles.verseText, { fontSize: dimensions.fontSize.caption }]} numberOfLines={1}>
                          {item.main_verse}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    backgroundColor: COLORS.surfaceElevated,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  studyCount: {
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
  recentCard: {
    backgroundColor: '#DDBBA1',
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
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDBBA1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: dimensions.spacing.md,
  },
  verseText: {
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: dimensions.spacing.sm,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    marginRight: dimensions.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
    minWidth: 30,
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
});
export default BibleStudyApp;