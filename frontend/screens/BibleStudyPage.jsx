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
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCategories } from '../api/categoryService';
import { fetchBibleReadings } from '../api/bibleReadingService'; 
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';

let DateTimePicker;
try {
  if (Platform.OS !== 'web') {
    const moduleName = '@react-native-community/datetimepicker';
    // use eval to avoid static require resolution by the bundler on web
    // eslint-disable-next-line no-eval
    DateTimePicker = eval('require')(moduleName).default;
  } else {
    DateTimePicker = ({ value, onChange }) => null;
  }
} catch (e) {
  // If the native package is not installed or fails to load, provide a safe fallback
  DateTimePicker = ({ value, onChange }) => null;
}

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
            {item.theme || item.category?.name || 'STUDY'}
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

// --- Replace existing VerticalGameMap with this upgraded, Duolingo-like version ---
const VerticalGameMap = ({ items, progressMap, completedSet, onPressItem }) => {
  const dimensions = getResponsiveDimensions();

  const getStatus = (item, index) => {
    const id = item.id;
    const prog = progressMap[id] || 0;
    if (completedSet.has(id) || prog === 100) return 'completed';
    const prevCompleted = items.slice(0, index).every(it => {
      const p = progressMap[it.id] || 0;
      return (completedSet.has(it.id) || p === 100);
    });
    return prevCompleted ? 'current' : 'locked';
  };

  return (
    <View style={styles.gameMapWrap}>
      <Text style={[styles.sectionTitle, { marginHorizontal: getResponsiveDimensions().spacing.md }]}>Journey</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: getResponsiveDimensions().spacing.md }}>
        {items.map((item, index) => {
          const status = getStatus(item, index);
          const size = dimensions.iconSize.large + 12;
          const outerSize = size + 14;
          const locked = status === 'locked';
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';
          const color = isCompleted ? COLORS.semantic.success : isCurrent ? COLORS.primary : COLORS.border.medium;
          const iconColor = (isCompleted || isCurrent) ? COLORS.background : COLORS.text.secondary;
          const label = item.day ? `Day ${item.day}` : (item.title || `#${item.id}`);

          return (
            <View key={item.id} style={styles.nodeRow}>
              <View style={styles.timelineColumn}>
                {/* top connector */}
                {index !== 0 && <View style={[styles.connectorLine, { backgroundColor: COLORS.border.light }]} />}
                <TouchableOpacity
                  activeOpacity={locked ? 1 : 0.85}
                  onPress={() => !locked && onPressItem(item, progressMap[item.id] || 0)}
                  style={[styles.nodeWrapper, { marginVertical: 6 }]}
                >
                  {/* outer ring */}
                  <View style={[
                    styles.nodeOuter,
                    {
                      width: outerSize,
                      height: outerSize,
                      borderRadius: outerSize / 2,
                      borderColor: color,
                      shadowColor: color,
                    }
                  ]}>
                    {/* inner circle */}
                    <View style={[
                      styles.nodeInner,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: isCompleted || isCurrent ? color : COLORS.surface,
                      }
                    ]}>
                      <Ionicons
                        name={isCompleted ? 'checkmark' : (locked ? 'lock-closed' : 'book')}
                        size={dimensions.iconSize.medium}
                        color={iconColor}
                      />
                    </View>
                  </View>

                  {/* small progress badge for current/completed */}
                  {!locked && (
                    <View style={[styles.nodeBadge, { backgroundColor: isCompleted ? COLORS.semantic.success : COLORS.primary }]}>
                      <Text style={[styles.nodeBadgeText, { fontSize: dimensions.fontSize.caption }]}>
                        {isCompleted ? '✓' : (progressMap[item.id] ? `${progressMap[item.id]}%` : '')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* bottom connector */}
                {index !== items.length - 1 && <View style={[styles.connectorLine, { backgroundColor: COLORS.border.light }]} />}
              </View>

              <View style={styles.detailColumn}>
                <Text style={[styles.nodeLabel, { fontSize: dimensions.fontSize.subtitle, color: locked ? COLORS.text.tertiary : COLORS.text.primary }]}>
                  {label}
                </Text>
                <Text numberOfLines={2} style={[styles.nodeSubtitle, { color: COLORS.text.secondary, fontSize: dimensions.fontSize.caption }]}>
                  {item.title || (item.theme ? item.theme : '')}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: getResponsiveDimensions().spacing.md, marginTop: getResponsiveDimensions().spacing.sm }}>
        <Text style={{ color: COLORS.text.secondary, fontSize: dimensions.fontSize.caption }}>
          Tap a node to open the day's study. Locked nodes require previous days to be completed.
        </Text>
      </View>
    </View>
  );
};
// --- end upgraded VerticalGameMap ---

// Main component
const BibleStudyApp = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [bibleReadings, setBibleReadings] = useState([]); // <-- CHANGED
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 5;
  const dimensions = getResponsiveDimensions();

  // New state for study plan modal and data
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null); // object { days, startDate, schedule: [[dayNumbers], ...] }
  const [planDays, setPlanDays] = useState(365);
  const [todaysReadings, setTodaysReadings] = useState([]);
  const [startDate, setStartDate] = useState(new Date()); // user selected start date
  const [showDatePicker, setShowDatePicker] = useState(false);

  // new: plan stats state
  const [planStats, setPlanStats] = useState({
    percent: 0,
    elapsedDays: 0,
    daysRemaining: 0,
    finishDate: null,
    startDate: null,
  });

  // Get category color based on category ID (now category.id can be theme string)
  const getCategoryColor = (categoryId) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    return categoryIndex >= 0 ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : COLORS.primary;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedCategories, fetchedBibleReadings] = await Promise.all([
          fetchCategories(),
          fetchBibleReadings()
        ]);

        // set raw readings
        setBibleReadings(fetchedBibleReadings);

        // Derive categories from reading.theme (fallback to fetchedCategories if you prefer)
        const themes = Array.from(new Set(
          (fetchedBibleReadings || [])
            .map(r => r.theme)
            .filter(Boolean)
        ));
        const themeCategories = themes.map(t => ({ id: t, name: t }));
        setCategories(themeCategories.length ? themeCategories : fetchedCategories);
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

  // Filter bibleReadings based on category and search query
  const filteredReadings = bibleReadings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      // match derived theme string or existing category id
      (item.theme && item.theme === selectedCategory) ||
      (item.category && item.category.id === selectedCategory);
    const matchesSearch = searchQuery === '' || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const totalPages = Math.ceil(filteredReadings.length / lessonsPerPage);
  const paginatedReadings = filteredReadings.slice((currentPage - 1) * lessonsPerPage, currentPage * lessonsPerPage);

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
      bibleReading: study, // <-- CHANGED
      progress,
      onProgressUpdate: (percent) => {
        setProgressMap((prev) => ({ ...prev, [study.id]: percent }));
      }
    });
  };

  // helper: build balanced schedule (array of arrays of reading.day numbers)
  const buildSchedule = (readings, totalDays) => {
    const items = readings.slice().sort((a,b)=>a.day - b.day);
    const n = items.length;
    const base = Math.floor(n / totalDays);
    const rem = n % totalDays;
    const schedule = [];
    let idx = 0;
    for (let i = 0; i < totalDays; i++) {
      const size = base + (i < rem ? 1 : 0);
      schedule.push(items.slice(idx, idx + size).map(r => r.day));
      idx += size;
    }
    return schedule;
  };

  // Save plan to AsyncStorage
  const savePlan = async (days) => {
    if (!bibleReadings || bibleReadings.length === 0) return;
    const schedule = buildSchedule(bibleReadings, days);
    const chosenStart = startDate ? startDate : new Date();
    const plan = {
      days,
      startDate: chosenStart.toISOString(),
      schedule
    };
    await AsyncStorage.setItem('studyPlan', JSON.stringify(plan));
    setStudyPlan(plan);
    setPlanModalVisible(false);
  };

  // Load saved plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const raw = await AsyncStorage.getItem('studyPlan');
        if (raw) {
          const plan = JSON.parse(raw);
          setStudyPlan(plan);
        } else {
          setTimeout(() => setPlanModalVisible(true), 600);
        }
      } catch (e) {
        console.error('Error loading study plan', e);
      }
    };
    loadPlan();
  }, []);

  // compute today's readings whenever bibleReadings or studyPlan changes
  useEffect(() => {
    if (!studyPlan || !bibleReadings || bibleReadings.length === 0) {
      setTodaysReadings([]);
      setPlanStats(prev => ({...prev, percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null}));
      return;
    }
    const start = new Date(studyPlan.startDate);
    const now = new Date();
    const diff = Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) - Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())) / (1000*60*60*24));
    const dayIndex = Math.max(0, Math.min(studyPlan.days - 1, diff)); // clamp
    const dayList = studyPlan.schedule[dayIndex] || [];
    // resolve day numbers to full reading objects
    const todays = dayList.map(dayNum => bibleReadings.find(r => Number(r.day) === Number(dayNum))).filter(Boolean);
    setTodaysReadings(todays);

    // compute plan stats
    const elapsedDays = Math.max(0, Math.min(studyPlan.days, diff + 1)); // count today
    const percent = Math.min(100, Math.round((elapsedDays / studyPlan.days) * 100));
    const daysRemaining = Math.max(0, studyPlan.days - elapsedDays);
    const finishDate = new Date(start.getTime() + (studyPlan.days - 1) * 24 * 60 * 60 * 1000);
    setPlanStats({
      percent,
      elapsedDays,
      daysRemaining,
      finishDate: finishDate.toISOString(),
      startDate: studyPlan.startDate,
    });
  }, [studyPlan, bibleReadings]);

  // function to clear/reset plan (optional)
  const clearPlan = async () => {
    await AsyncStorage.removeItem('studyPlan');
    setStudyPlan(null);
    setPlanModalVisible(true);
  };

  if (loading && bibleReadings.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }

  // Separate studies into ongoing and completed
  const ongoingStudies = paginatedReadings.filter(item => {
    const progress = progressMap[item.id] || 0;
    return !(progress === 100 || completedStudies.has(item.id));
  });
  
  const completedStudiesList = paginatedReadings.filter(item => {
    const progress = progressMap[item.id] || 0;
    return progress === 100 || completedStudies.has(item.id);
  });

  // Format date for display
  const formatDate = (d) => {
    if (!d) return '-';
    const date = (typeof d === 'string') ? new Date(d) : d;
    return date.toLocaleDateString();
  };

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
          {/* Quick access to study plan */}
          <TouchableOpacity onPress={() => setPlanModalVisible(true)} style={{ marginLeft: 8 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{studyPlan ? `${studyPlan.days}d plan` : 'Pick a plan'}</Text>
          </TouchableOpacity>
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

      {/* Today's Challenge Card */}
      {studyPlan && todaysReadings.length > 0 && (
        <TouchableOpacity
          style={[styles.todayCard]}
          onPress={() => {
            // navigate to first reading of today's list or a dedicated screen that shows all today's readings
            handleNavigateToStudy(todaysReadings[0], progressMap[todaysReadings[0].id] || 0);
          }}
        >
          <Text style={styles.todayTitle}>Today's challenge</Text>
          <Text numberOfLines={1} style={styles.todaySubtitle}>
            {todaysReadings.map(r => r.title).join(' • ')}
          </Text>
        </TouchableOpacity>
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
              {filteredReadings.length} result{filteredReadings.length !== 1 ? 's' : ''} 
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in "${categories.find(c => c.id === selectedCategory)?.name}"`}
            </Text>
          </View>
        )}

        {/* Check if we have any filtered studies */}
        {filteredReadings.length === 0 ? (
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

            {/* Replace list with GameMap */}
            <View style={{ paddingVertical: getResponsiveDimensions().spacing.sm }}>
              <VerticalGameMap
                items={paginatedReadings}
                progressMap={progressMap}
                completedSet={completedStudies}
                onPressItem={handleNavigateToStudy}
              />
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

      {/* Study Plan Modal */}
      <Modal
        visible={planModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlanModalVisible(false)}
      >
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', padding:20 }}>
          <View style={{ backgroundColor:COLORS.surfaceElevated, borderRadius:12, padding:20 }}>
            <Text style={{ fontSize:18, fontWeight:'700', color:COLORS.text.primary, marginBottom:12 }}>Choose a reading plan</Text>
            <Text style={{ color:COLORS.text.secondary, marginBottom:16 }}>Pick how many days you want to finish the whole Bible; we will group readings per day for you.</Text>
            {/* Start date selector */}
            <View style={{ marginBottom:12 }}>
              <Text style={{ color: COLORS.text.secondary, marginBottom:6 }}>Start date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{ padding:12, borderRadius:8, borderWidth:1, borderColor:COLORS.border.light, backgroundColor: COLORS.surface }}
              >
                <Text style={{ color: COLORS.text.primary }}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selected) => {
                    setShowDatePicker(false);
                    if (selected) setStartDate(selected);
                  }}
                />
              )}
            </View>
             {[365, 120, 90, 60].map(d => (
               <TouchableOpacity
                 key={d}
                 onPress={() => {
                  setPlanDays(d);
                  savePlan(d);
                 }}
                 style={{ paddingVertical:12, paddingHorizontal:16, borderRadius:8, backgroundColor: planDays===d ? COLORS.primary : COLORS.surface, marginBottom:8 }}
               >
                 <Text style={{ color: planDays===d ? '#fff' : COLORS.text.primary, fontWeight:'600' }}>{d} days</Text>
                 <Text style={{ color: planDays===d ? '#fff' : COLORS.text.secondary, fontSize:12 }}>{Math.ceil((bibleReadings?.length || 365)/d)} reading(s) per day</Text>
               </TouchableOpacity>
             ))}
             <TouchableOpacity onPress={() => { setPlanModalVisible(false); }} style={{ marginTop:12, alignSelf:'flex-end' }}>
               <Text style={{ color:COLORS.primary }}>Close</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>

      {/* Plan summary (shows days/progress) */}
      {studyPlan && (
        <View style={styles.planSummary}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.planTitle}>{studyPlan.days}‑day plan</Text>
              <Text style={styles.planSubtitle}>
                Started {formatDate(planStats.startDate || studyPlan.startDate)} • Finish {planStats.finishDate ? formatDate(planStats.finishDate) : '-'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.planPercent}>{planStats.percent}%</Text>
              <Text style={styles.planSmall}>Remaining: {planStats.daysRemaining} day{planStats.daysRemaining !== 1 ? 's' : ''}</Text>
            </View> 
          </View>
          
          {/* Progress Bar */}
          <View style={styles.planProgressBar}>
            <View style={[styles.planProgressFill, { width: `${planStats.percent}%` }]} />
          </View>
        </View>
      )}
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
    backgroundColor: COLORS.surfaceElevated,
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
    height: getResponsiveDimensions().imageHeight,
    backgroundColor: COLORS.surface,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  categoryBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: COLORS.background,
    fontWeight: '700',
  },
  progressBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  progressBadgeText: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  cardContent: {
    padding: getResponsiveDimensions().spacing.md,
  },
  entryTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: getResponsiveDimensions().spacing.sm,
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
    backgroundColor: COLORS.surface,
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
  sectionDivider: {
    height: 8,
    backgroundColor: COLORS.border.light,
    marginVertical: 8,
  },
  todayCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: getResponsiveDimensions().spacing.md,
    margin: getResponsiveDimensions().spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: getResponsiveDimensions().spacing.xs,
  },
  todaySubtitle: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  planSummary: {
    backgroundColor: COLORS.surfaceElevated,
    marginHorizontal: getResponsiveDimensions().spacing.md,
    marginTop: getResponsiveDimensions().spacing.md,
    padding: getResponsiveDimensions().spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  planTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  planPercent: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 20,
  },
  planSmall: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  planProgressBar: {
    height: 8,
    backgroundColor: COLORS.border.light,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: getResponsiveDimensions().spacing.sm,
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  gameMapWrap: {
    marginTop: getResponsiveDimensions().spacing.md,
    marginBottom: getResponsiveDimensions().spacing.md,
  },
  nodeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveDimensions().spacing.xs,
  },
  nodeLabel: {
    textAlign: 'center',
    maxWidth: 80,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveDimensions().spacing.md,
  },
  centerColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: COLORS.border.light,
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -1,
    zIndex: 1,
  },
  nodeWrapper: {
    zIndex: 2,
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineColumn: {
    width: 78,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  detailColumn: {
    flex: 1,
    paddingLeft: getResponsiveDimensions().spacing.md,
    justifyContent: 'center',
  },
  nodeOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  nodeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 28,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  nodeBadgeText: {
    color: COLORS.background,
    fontWeight: '700',
  },
  nodeSubtitle: {
    marginTop: 4,
  },
});

export default BibleStudyApp;
