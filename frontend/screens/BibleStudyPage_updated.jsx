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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCategories } from '../api/categoryService';
import { fetchStarks } from '../api/starksService';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Bible study images
const BIBLE_STUDY_IMAGES = [
  require('../assets/images/img1.jpg'),
  require('../assets/images/img2.jpg'),
  require('../assets/images/img3.jpg'),
  require('../assets/images/img5.jpg'),
  require('../assets/images/img6.jpg'),
  require('../assets/images/img4.jpg'),
];

// Function to get random image for each study
const getRandomImage = (studyId) => {
  const index = studyId % BIBLE_STUDY_IMAGES.length;
  return BIBLE_STUDY_IMAGES[index];
};

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    imageHeight: isTablet ? 180 : 140,
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

// Professional color palette
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

// Single study card component
const StudyCard = ({ item, progress, isCompleted, categoryColor, handleNavigate, handleRestart }) => {
  const dimensions = getResponsiveDimensions();
  
  return (
    <TouchableOpacity
      style={[styles.entryCard, isCompleted && styles.completedEntryCard]}
      onPress={() => handleNavigate(item, progress)}
      activeOpacity={0.7}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={getRandomImage(item.id)} 
          style={[styles.cardImage, { height: dimensions.imageHeight }]}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        {/* Category Badge on Image */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}> 
          <Text style={[styles.categoryBadgeText, { fontSize: dimensions.fontSize.caption }]}> 
            {item.category?.name || 'STUDY'}
          </Text>
        </View>
        {/* Progress/Completed Badge - Top Right */}
        <View style={[styles.progressBadge, isCompleted && styles.completedBadge]}>
          <Text style={[styles.progressBadgeText, { fontSize: dimensions.fontSize.caption }]}> 
            {isCompleted ? 'FINISHED' : `${progress}%`}
          </Text>
        </View>
      </View>
      {/* Content Container - Simplified */}
      <View style={styles.cardContent}>
        <Text style={[styles.entryTitle, { fontSize: dimensions.fontSize.subtitle }]} numberOfLines={2}>
          {item.title}
        </Text>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                isCompleted && styles.completedProgressFill
              ]}
            />

          </View>
        </View>
        
        {/* Restart button for completed studies */}
        {isCompleted && (
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRestart(item.id);
            }}
          >
            <Ionicons name="refresh-outline" size={dimensions.iconSize.small} color="#FFFFFF" />
            <Text style={styles.restartButtonText}>Restart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Main component
const BibleStudyApp = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [starks, setStarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 5;
  const dimensions = getResponsiveDimensions();

  // Get category color based on category ID
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
    
    // Load completed studies
    AsyncStorage.getItem('completedStudies').then(data => {
      if (data) {
        const completedIds = JSON.parse(data);
        setCompletedStudies(new Set(completedIds));
      }
    });
  }, []);

  // Save progress to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
    
    // Check for completed studies (100% progress)
    const newCompleted = new Set(completedStudies);
    let hasChanges = false;
    
    Object.entries(progressMap).forEach(([id, progress]) => {
      if (progress === 100 && !completedStudies.has(Number(id))) {
        newCompleted.add(Number(id));
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setCompletedStudies(newCompleted);
      AsyncStorage.setItem('completedStudies', JSON.stringify([...newCompleted]));
    }
  }, [progressMap, completedStudies]);

  // Filter starks based on category and search query
  const filteredStarks = starks.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      (item.category && item.category.id === selectedCategory);
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const totalPages = Math.ceil(filteredStarks.length / lessonsPerPage);
  const paginatedStarks = filteredStarks.slice((currentPage - 1) * lessonsPerPage, currentPage * lessonsPerPage);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };
  
  // Function to restart a completed study
  const handleRestartStudy = (studyId) => {
    // Set progress to 0%
    setProgressMap(prev => ({...prev, [studyId]: 0}));
    
    // Remove from completed studies
    const newCompleted = new Set(completedStudies);
    newCompleted.delete(studyId);
    setCompletedStudies(newCompleted);
    AsyncStorage.setItem('completedStudies', JSON.stringify([...newCompleted]));
  };

  const handleNavigateToStudy = (study, progress) => {
    navigation.navigate('BibleStudyContent', {
      stark: study,
      progress,
      onProgressUpdate: (percent) => {
        setProgressMap((prev) => ({ ...prev, [study.id]: percent }));
      }
    });
  };

  if (loading && starks.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }

  // Separate studies into ongoing and completed
  const ongoingStudies = paginatedStarks.filter(item => {
    const progress = progressMap[item.id] || 0;
    return !(progress === 100 || completedStudies.has(item.id));
  });
  
  const completedStudiesList = paginatedStarks.filter(item => {
    const progress = progressMap[item.id] || 0;
    return progress === 100 || completedStudies.has(item.id);
  });

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
              onChangeText={(text) => {
                setSearchQuery(text);
                setCurrentPage(1); 
              }}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
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

        {/* Check if we have any filtered studies */}
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
                  setCurrentPage(1);
                }}
              >
                <Text style={[styles.clearFiltersText, { fontSize: dimensions.fontSize.caption }]}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Ongoing Studies Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Ongoing Studies
              </Text>
              <Text style={[styles.studyCount, { fontSize: dimensions.fontSize.caption }]}>
                {ongoingStudies.length} studies
              </Text>
            </View>

            {/* Ongoing Studies Entries */}
            <View style={styles.entriesContainer}>
              {ongoingStudies.length === 0 ? (
                <View style={styles.emptySectionContainer}>
                  <Text style={[styles.emptySectionText, { fontSize: dimensions.fontSize.body }]}>
                    No ongoing studies. Start a new study or check your completed studies below.
                  </Text>
                </View>
              ) : (
                ongoingStudies.map((item) => {
                  const categoryColor = getCategoryColor(item.category?.id);
                  const progress = progressMap[item.id] || 0;
                  
                  return (
                    <StudyCard
                      key={item.id}
                      item={item}
                      progress={progress}
                      isCompleted={false}
                      categoryColor={categoryColor}
                      handleNavigate={handleNavigateToStudy}
                      handleRestart={handleRestartStudy}
                    />
                  );
                })
              )}
            </View>

            {/* Completed Studies Section */}
            <View style={[styles.sectionHeader, styles.completedSectionHeader]}>
              <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Completed Studies
              </Text>
              <Text style={[styles.studyCount, { fontSize: dimensions.fontSize.caption }]}>
                {completedStudiesList.length} studies
              </Text>
            </View>

            {/* Completed Studies Entries */}
            <View style={styles.entriesContainer}>
              {completedStudiesList.length === 0 ? (
                <View style={styles.emptySectionContainer}>
                  <Text style={[styles.emptySectionText, { fontSize: dimensions.fontSize.body }]}>
                    You haven't completed any studies yet. Complete a study to see it here.
                  </Text>
                </View>
              ) : (
                completedStudiesList.map((item) => {
                  const categoryColor = getCategoryColor(item.category?.id);
                  const progress = progressMap[item.id] || 0;
                  
                  return (
                    <StudyCard
                      key={item.id}
                      item={item}
                      progress={progress}
                      isCompleted={true}
                      categoryColor={categoryColor}
                      handleNavigate={handleNavigateToStudy}
                      handleRestart={handleRestartStudy}
                    />
                  );
                })
              )}
            </View>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 }}>
                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ padding: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <Text style={{ fontSize: 18, color: COLORS.primary }}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 16, fontSize: 16 }}>
                  Page {currentPage} of {totalPages}
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ padding: 8, opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <Text style={{ fontSize: 18, color: COLORS.primary }}>{'>'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    padding: getResponsiveDimensions().spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: getResponsiveDimensions().spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.background, // Changed to white background
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.md,
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
    gap: getResponsiveDimensions().spacing.sm,
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
  searchContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: getResponsiveDimensions().spacing.sm,
    color: COLORS.text.primary,
  },
  clearSearchButton: {
    padding: getResponsiveDimensions().spacing.xs,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  filterContentContainer: {
    paddingVertical: getResponsiveDimensions().spacing.sm,
    gap: getResponsiveDimensions().spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: getResponsiveDimensions().spacing.sm,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inactiveFilter: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border.light,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: getResponsiveDimensions().spacing.xs,
  },
  filterText: {
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.background,
  },
  inactiveFilterText: {
    color: COLORS.text.secondary,
  },
  resultsInfo: {
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  resultsText: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  sectionHeader: {
    paddingHorizontal: getResponsiveDimensions().spacing.md,
    paddingVertical: getResponsiveDimensions().spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  studyCount: {
    color: COLORS.text.secondary,
  },
  entriesContainer: {
    paddingHorizontal: getResponsiveDimensions().spacing.md,
  },
  entryCard: {
    marginBottom: getResponsiveDimensions().spacing.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: getResponsiveDimensions().spacing.sm,
    paddingVertical: getResponsiveDimensions().spacing.xs,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: getResponsiveDimensions().spacing.sm,
    paddingVertical: getResponsiveDimensions().spacing.xs,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardContent: {
    padding: getResponsiveDimensions().spacing.md,
  },
  entryTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: getResponsiveDimensions().spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: getResponsiveDimensions().spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    marginBottom: getResponsiveDimensions().spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  emptyTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: getResponsiveDimensions().spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: getResponsiveDimensions().spacing.lg,
  },
  clearFiltersButton: {
    paddingHorizontal: getResponsiveDimensions().spacing.lg,
    paddingVertical: getResponsiveDimensions().spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  clearFiltersText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  completedBadge: {
    backgroundColor: COLORS.semantic.success,
  },
  completedProgressFill: {
    backgroundColor: COLORS.semantic.success,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 10,
    alignSelf: 'center',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  completedSectionHeader: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingTop: 16,
  },
  completedEntryCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.semantic.success,
  },
  emptySectionContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: 16,
  },
  emptySectionText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default BibleStudyApp;
