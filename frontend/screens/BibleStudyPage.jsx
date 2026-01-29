import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { fetchBibleReadings } from '../api/bibleReadingService';
import { fetchBooks } from '../api/bookService';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';
import { createStyles, COLORS } from '../styles/bIbleStudyContent.styles';
import BottomNavBar from '../components/BottomNavBar';
import StudyPlanModal from '../components/StudyPlanModal';
import TypeFilterModal from '../components/TypeFilterModal';
import UnlockModal from '../components/UnlockModal';
const styles = createStyles();
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 24 : 20,
      subtitle: isTablet ? 18 : 16,
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

const dimensions = getResponsiveDimensions();
// Video Background Component
const VideoBackground = () => {
  return (
    <View style={styles.videoBackground}>
      <Video
        source={require('../assets/view.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        muted
        rate={1.0}
      />
      <View style={styles.videoOverlay} />
    </View>
  );
};

// Vertical Journey Map - Snake path layout
const VerticalGameMap = ({ items, progressMap, completedSet, onPressItem, onRequestUnlock, todaysReadingIds = new Set() }) => {
  const dimensions = getResponsiveDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for current node
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Pop animation for current node ring
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        Animated.timing(popAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const getStatus = (item, index) => {
    // Books are always accessible (no locking)
    if (item.id && item.id.toString().startsWith('book_')) {
      const id = item.id;
      const prog = progressMap[id] || 0;
      return (completedSet.has(id) || prog === 100) ? 'completed' : 'current';
    }
    
    // Bible readings follow the normal locking logic
    const id = item.id;
    const prog = progressMap[id] || 0;
    if (completedSet.has(id) || prog === 100) return 'completed';
    const prevCompleted = items.slice(0, index).every(it => {
      const p = progressMap[it.id] || 0;
      return (completedSet.has(it.id) || p === 100);
    });
    return prevCompleted ? 'current' : 'locked';
  };

  // Snake pattern: creates a zigzag path
  const getNodePosition = (index) => {
    const row = Math.floor(index / 3);
    const posInRow = index % 3;
    const isEvenRow = row % 2 === 0;
    
    let position;
    
    if (isEvenRow) {
      switch (posInRow) {
        case 0:
          position = { alignSelf: 'flex-start', marginLeft: 30 };
          break;
        case 1:
          position = { alignSelf: 'center' };
          break;
        case 2:
          position = { alignSelf: 'flex-end', marginRight: 30 };
          break;
      }
    } else {
      switch (posInRow) {
        case 0:
          position = { alignSelf: 'flex-end', marginRight: 30 };
          break;
        case 1:
          position = { alignSelf: 'center' };
          break;
        case 2:
          position = { alignSelf: 'flex-start', marginLeft: 30 };
          break;
      }
    }
    
    return position;
  };

  // Get rotation angle for 3D effect
  const getNodeRotation = (index) => {
    const posInRow = index % 3;
    const row = Math.floor(index / 3);
    const isEvenRow = row % 2 === 0;
    
    if (isEvenRow) {
      switch (posInRow) {
        case 0: return '-8deg';
        case 1: return '0deg';
        case 2: return '8deg';
      }
    } else {
      switch (posInRow) {
        case 0: return '8deg';
        case 1: return '0deg';
        case 2: return '-8deg';
      }
    }
    return '0deg';
  };

  // Add spacing after each group of 3
  const getExtraMargin = (index) => {
    const posInRow = index % 3;
    return posInRow === 2 ? 20 : 8; // Extra space after last item in group
  };

  return (
    <View style={styles.gameMapWrap}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.journeyContainer}
      >
        {items.map((item, index) => {
          const status = getStatus(item, index);
          const locked = status === 'locked';
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';
          const isTodaysReading = todaysReadingIds.has(item.id); // Check if this is today's reading
          const label = item.day ? `Day ${item.day}` : (item.title || item.name || `#${item.id}`);
          const previousItem = items[index - 1];
          const positionStyle = getNodePosition(index);
          const rotation = getNodeRotation(index);
          const extraMargin = getExtraMargin(index);

          const handlePress = () => {
            if (locked) {
              if (typeof onRequestUnlock === 'function') onRequestUnlock(item, index, previousItem);
              return;
            }
            if (typeof onPressItem === 'function') onPressItem(item, progressMap[item.id] || 0);
          };

          let nodeColor = COLORS.locked;
          let iconName = 'lock-closed';
          let iconColor = '#FFFFFF';
          
          if (isCompleted) {
            // Green only for successful/completed nodes
            nodeColor = COLORS.semantic.success;
            iconName = 'checkmark';
            iconColor = '#FFFFFF';
          } else if (isTodaysReading) {
            // Golden/coffee color for today's readings
            nodeColor = COLORS.primary; // Coffee/golden color
            iconName = 'book';
            iconColor = '#FFFFFF';
          } else if (isCurrent) {
            // Golden/coffee color for current nodes
            nodeColor = COLORS.primary; // Coffee/golden color
            iconName = 'book';
            iconColor = '#FFFFFF';
          }

          return (
            <View key={item.id} style={[styles.nodeWrapper, positionStyle, { marginVertical: extraMargin }]}>
              <TouchableOpacity
                activeOpacity={locked ? 0.9 : 0.7}
                onPress={handlePress}
                style={styles.nodeTouchable}
              >
                {/* Outer pulsing ring for current node or today's reading */}
                {(isCurrent || isTodaysReading) && (
                  <Animated.View
                    style={[
                      styles.currentNodeRing,
                      {
                        transform: [{ scale: popAnim }],
                        borderColor: nodeColor,
                        borderWidth: isTodaysReading ? 3 : 2, // Thicker border for today's readings
                      }
                    ]}
                  />
                )}

                {/* External bottom shadow */}
                <View style={[styles.nodeExternalShadow, { backgroundColor: nodeColor }]} />

                {/* 3D Node with rotation */}
                <Animated.View
                  style={[
                    styles.nodeCircle,
                    {
                      backgroundColor: nodeColor,
                      transform: [
                        { rotate: rotation },
                        { scale: (isCurrent || isTodaysReading) ? pulseAnim : 1 },
                        { perspective: 1000 },
                        { rotateX: '15deg' },
                      ],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: isTodaysReading ? 0.5 : 0.3,
                      shadowRadius: isTodaysReading ? 16 : 12,
                      elevation: isTodaysReading ? 20 : 15,
                    }
                  ]}
                >
                  {/* Inner shadow for depth */}
                  <View style={styles.nodeInnerShadow} />
                  
                  <Ionicons
                    name={iconName}
                    size={dimensions.iconSize.large}
                    color={iconColor}
                    style={{ zIndex: 2 }}
                  />
                </Animated.View>

                {/* Label below node */}
                <View style={styles.nodeLabelContainer}>
                  <Text style={[
                    styles.nodeLabel,
                    { color: locked ? COLORS.text.tertiary : COLORS.text.light }
                  ]}>
                    {label}
                  </Text>
                  <Text 
                    numberOfLines={2} 
                    style={[
                      styles.nodeSubtitle,
                      { color: locked ? COLORS.text.tertiary : 'rgba(247, 240, 227, 0.8)' }
                    ]}
                  >
                    {item.title || item.name || (item.theme ? item.theme : '')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Main component
const BibleStudyApp = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [bibleReadings, setBibleReadings] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());

  // Study plan state
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [planDays, setPlanDays] = useState(365);
  const [startDate, setStartDate] = useState(new Date());
  const [planStats, setPlanStats] = useState({
    percent: 0,
    elapsedDays: 0,
    daysRemaining: 0,
    finishDate: null,
    startDate: null,
  });
  const [todaysReadingIds, setTodaysReadingIds] = useState(new Set()); // Track today's readings for highlighting
  const [encouragementMessage, setEncouragementMessage] = useState(null); // Track encouragement/sad messages
  const [planJustChanged, setPlanJustChanged] = useState(false); // Track if plan just changed
  const [readingStats, setReadingStats] = useState({
    lessonsAhead: 0,
    consistency: 0,
    streak: 0,
  });

  // Unlock modal state
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);

  // Filter modal states
  const [typeFilterModalVisible, setTypeFilterModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('historical'); // 'historical' (shows all), 'pickupbook'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load bible readings
        const fetchedBibleReadings = await fetchBibleReadings();
        setBibleReadings(fetchedBibleReadings || []);

        // Load books separately - don't fail if this fails
        try {
          const fetchedBooks = await fetchBooks();
          console.log('Books fetched successfully:', fetchedBooks?.length || 0, 'books');
          setBooks(fetchedBooks || []);
        } catch (bookError) {
          console.error('Error fetching books (non-critical):', bookError);
          console.error('Book error details:', bookError.message);
          setBooks([]); // Set empty array if books fail to load
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('bibleProgress').then(data => {
      if (data) setProgressMap(JSON.parse(data));
    });
    
    AsyncStorage.getItem('completedStudies').then(data => {
      if (data) {
        const completedIds = JSON.parse(data);
        setCompletedStudies(new Set(completedIds));
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
    
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

  // Transform books to match node format
  const transformedBooks = (books || []).map(book => ({
    ...book,
    title: book.name,
    id: `book_${book.id}`,
  }));

  // Filter books by search query
  const filteredBooks = transformedBooks.filter(book => {
    const matchesSearch = searchQuery === '' || 
      (book.name && book.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });


  const filteredReadings = bibleReadings.filter(item => {
    // Type filter: historical shows ALL readings, other types filter by type
    let matchesType = true;
    if (selectedType === 'historical') {
      // Show all readings when historical is selected
      matchesType = true;
    } else if (selectedType === 'pickupbook') {
      // Don't show readings when pickupbook is selected (books will be shown instead)
      matchesType = false;
    } else {
      // For video or other types, filter by type
      matchesType = 
        (item.type && item.type.toLowerCase() === selectedType.toLowerCase()) ||
        (item.category && item.category.name && item.category.name.toLowerCase().includes(selectedType.toLowerCase()));
    }
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  // Determine which items to display based on selected type
  const displayItems = selectedType === 'pickupbook' ? filteredBooks : filteredReadings;

  // Debug logging for pickupbook filter
  useEffect(() => {
    if (selectedType === 'pickupbook') {
      console.log('=== Pickupbook Filter Active ===');
      console.log('Books loaded:', books.length);
      console.log('Filtered books:', filteredBooks.length);
      console.log('Display items:', displayItems.length);
      if (displayItems.length > 0) {
        console.log('Sample book:', displayItems[0]);
      } else {
        console.warn('No books to display!');
      }
    }
  }, [selectedType, books.length, filteredBooks.length, displayItems.length]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setTypeFilterModalVisible(false);
  };

  const handleNavigateToStudy = (study, progress) => {
    navigation.navigate('BibleStudyContent', {
      bibleReading: study,
      allReadings: filteredReadings,
      progress,
      onProgressUpdate: (percent) => {
        setProgressMap((prev) => ({ ...prev, [study.id]: percent }));
      }
    });
  };

  // Book name to book ID mapping for API
  const getBookIdFromName = (bookName) => {
    const bookMapping = {
      'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
      'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
      '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
      '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
      'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
      'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
      'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
      'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
      'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
      'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
      'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
      'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
      'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
      '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
      'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
      '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
      '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV',
    };
    return bookMapping[bookName] || 'GEN';
  };

  const handleNavigateToBook = async (book) => {
    try {
      // Get Bible preferences
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage') || 'english';
      const savedBibleId = await AsyncStorage.getItem('selectedBibleId') || '65eec8e0b60e656b-01';
      
      const bookId = getBookIdFromName(book.name);
      
      navigation.navigate('BookContent', {
        book: { id: bookId, name: book.name },
        chapter: { number: '1' },
        bibleId: savedBibleId,
        language: savedLanguage,
      });
    } catch (error) {
      console.error('Error navigating to book:', error);
    }
  };

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

  const savePlan = async (days, chosenStartDate) => {
    if (!bibleReadings || bibleReadings.length === 0) return;
    
    // Check if plan days changed - if so, reset all progress
    const existingPlan = await AsyncStorage.getItem('studyPlan');
    const previousPlan = existingPlan ? JSON.parse(existingPlan) : null;
    const planChanged = previousPlan && previousPlan.days !== days;
    
    if (planChanged) {
      // Reset all progress when plan changes
      await AsyncStorage.removeItem('bibleProgress');
      await AsyncStorage.removeItem('completedStudies');
      
      // Clear all lesson completion flags
      const allKeys = await AsyncStorage.getAllKeys();
      const lessonKeys = allKeys.filter(key => key.startsWith('lesson_') && key.includes('_completed'));
      await AsyncStorage.multiRemove(lessonKeys);
      
      // Reset progress map and completed studies
      setProgressMap({});
      setCompletedStudies(new Set());
      
      // Clear daily reading tracking
      await AsyncStorage.removeItem('dailyReadingHistory');
      await AsyncStorage.removeItem('readingStreak');
      await AsyncStorage.removeItem('lastReadingDate');
      
      // Set flag to show challenge start message
      setPlanJustChanged(true);
    }
    
    const schedule = buildSchedule(bibleReadings, days);
    const chosenStart = chosenStartDate || startDate || new Date();
    setStartDate(chosenStart); // Update startDate state
    const plan = {
      days,
      startDate: chosenStart.toISOString(),
      schedule,
      planChangedAt: new Date().toISOString(), // Track when plan was set/changed
    };
    await AsyncStorage.setItem('studyPlan', JSON.stringify(plan));
    setStudyPlan(plan);
    setPlanModalVisible(false);
    
    // Show challenge start message if plan changed or is new
    if (planChanged || !previousPlan) {
      const challengeMessage = {
        type: 'happy',
        emoji: '🎯',
        text: `You've started a ${days}-day Bible reading challenge! Let's do this!`,
      };
      setEncouragementMessage(challengeMessage);
      setTimeout(() => {
        setEncouragementMessage(null);
        // Clear the flag after message is dismissed
        setTimeout(() => {
          setPlanJustChanged(false);
        }, 1000);
      }, 5000);
    }
  };

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const raw = await AsyncStorage.getItem('studyPlan');
        if (raw) {
          const plan = JSON.parse(raw);
          setStudyPlan(plan);
          setPlanDays(plan.days); // Set planDays from loaded plan
        } else {
          setTimeout(() => setPlanModalVisible(true), 600);
        }
      } catch (e) {
        console.error('Error loading study plan', e);
      }
    };
    loadPlan();
  }, []);

  // Update planDays when modal opens and studyPlan exists
  useEffect(() => {
    if (planModalVisible && studyPlan) {
      setPlanDays(studyPlan.days);
    }
  }, [planModalVisible, studyPlan]);

  // Check if consistency notification was already shown today
  const checkConsistencyNotificationShown = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const shownKey = `consistencyNotificationShown_${today}`;
      const shown = await AsyncStorage.getItem(shownKey);
      return shown === 'true';
    } catch (error) {
      return false;
    }
  };

  // Mark consistency notification as shown for today
  const markConsistencyNotificationShown = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const shownKey = `consistencyNotificationShown_${today}`;
      await AsyncStorage.setItem(shownKey, 'true');
    } catch (error) {
      console.error('Error marking consistency notification as shown:', error);
    }
  };

  // Calculate reading statistics and encouragement
  const calculateReadingStats = async () => {
    if (!studyPlan || !bibleReadings || bibleReadings.length === 0) return;
    
    const start = new Date(studyPlan.startDate);
    const now = new Date();
    const diff = Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) - Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())) / (1000*60*60*24));
    const elapsedDays = Math.max(0, Math.min(studyPlan.days, diff + 1));
    
    // Get completed studies
    const completedData = await AsyncStorage.getItem('completedStudies');
    const completedIds = completedData ? JSON.parse(completedData) : [];
    const completedSet = new Set(completedIds);
    
    // Calculate how many lessons should be completed by now
    let expectedCompleted = 0;
    if (studyPlan.days !== 365 && studyPlan.schedule) {
      // For custom plans, count lessons up to today
      for (let i = 0; i <= Math.min(elapsedDays - 1, studyPlan.schedule.length - 1); i++) {
        expectedCompleted += (studyPlan.schedule[i] || []).length;
      }
    } else {
      // For 365-day plan, 1 lesson per day
      expectedCompleted = elapsedDays;
    }
    
    // Count actually completed lessons
    const actualCompleted = completedIds.length;
    const lessonsAhead = actualCompleted - expectedCompleted;
    
    // Calculate consistency (last 7 days)
    const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
    const history = dailyHistory ? JSON.parse(dailyHistory) : {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last7Days.push(history[dateKey] || 0);
    }
    const daysWithReading = last7Days.filter(count => count > 0).length;
    const consistency = Math.round((daysWithReading / 7) * 100);
    
    // Calculate streak
    let streak = 0;
    const lastReadingDate = await AsyncStorage.getItem('lastReadingDate');
    if (lastReadingDate) {
      const lastDate = new Date(lastReadingDate);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (daysSince === 0) {
        // Count consecutive days
        let currentDate = new Date(today);
        streak = 0;
        while (true) {
          const dateKey = currentDate.toISOString().split('T')[0];
          if (history[dateKey] && history[dateKey] > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    setReadingStats({ lessonsAhead, consistency, streak });
    
    // Generate encouragement message with priority system
    let message = null;
    
    // Priority 1: Challenge start message (if plan just changed)
    if (planJustChanged) {
      // This will be handled in savePlan, so we skip here
      return;
    }
    
    // Priority 2: If ahead of schedule, show celebration banner
    if (lessonsAhead >= 1) {
      message = {
        type: 'happy',
        emoji: '🎉',
        text: `Amazing! You're ${lessonsAhead} lesson${lessonsAhead > 1 ? 's' : ''} ahead of schedule! Keep it up!`,
      };
    } 
    // Priority 3: Streak message
    else if (streak >= 7) {
      message = {
        type: 'happy',
        emoji: '🔥',
        text: `Incredible ${streak}-day streak! You're on fire!`,
      };
    }
    // Priority 4: Consistency messages (only once per day)
    else {
      const consistencyShownToday = await checkConsistencyNotificationShown();
      if (!consistencyShownToday) {
        if (consistency < 30) {
          message = {
            type: 'sad',
            emoji: '😔',
            text: `You've been a bit inconsistent. Read more today to achieve your goal!`,
          };
          await markConsistencyNotificationShown();
        } else if (consistency < 60) {
          message = {
            type: 'neutral',
            emoji: '📖',
            text: `Keep going! You're making progress.`,
          };
          await markConsistencyNotificationShown();
        } else if (consistency >= 80) {
          message = {
            type: 'happy',
            emoji: '✨',
            text: `Great consistency! You're doing amazing!`,
          };
          await markConsistencyNotificationShown();
        }
      }
    }
    
    // Set message and auto-dismiss after 5 seconds
    if (message) {
      setEncouragementMessage(message);
      setTimeout(() => {
        setEncouragementMessage(null);
      }, 5000);
    }
  };

  useEffect(() => {
    const updatePlanStats = async () => {
      if (!studyPlan || !bibleReadings || bibleReadings.length === 0) {
        setPlanStats(prev => ({...prev, percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null}));
        setTodaysReadingIds(new Set());
        return;
      }
      const start = new Date(studyPlan.startDate);
      const now = new Date();
      const diff = Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) - Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())) / (1000*60*60*24));
      const elapsedDays = Math.max(0, Math.min(studyPlan.days, diff + 1));
      
      // Calculate progress based on plan type
      try {
        const completedData = await AsyncStorage.getItem('completedStudies');
        const completedIds = completedData ? JSON.parse(completedData) : [];
        const totalLessons = bibleReadings.length;
        const completedLessons = completedIds.length;
        
        let percent = 0;
        
        // For 365-day plan, calculate progress to show meaningful percentage
        if (studyPlan.days === 365) {
          // Show progress as percentage of days elapsed
          // For first 100 days: day number = percentage (Day 1 = 1%, Day 10 = 10%, Day 100 = 100%)
          // After 100 days: continue to increase but cap at 100%
          if (elapsedDays <= 100) {
            // For first 100 days, show day number as percentage
            percent = Math.max(1, elapsedDays);
          } else {
            // After 100 days, still show 100% (you've completed the meaningful milestone)
            // Or if you want it to continue: percent = Math.min(100, Math.round((elapsedDays / 365) * 100));
            // But since elapsedDays can be up to 365, (elapsedDays/365)*100 = up to 100%
            percent = 100; // Cap at 100% after day 100
          }
          
          // If user has completed more lessons than days elapsed, reward them
          // Use lessons-based progress if it's higher
          const lessonsBasedProgress = Math.min(100, Math.round((completedLessons / 365) * 100));
          if (completedLessons > elapsedDays && lessonsBasedProgress > percent) {
            percent = lessonsBasedProgress;
          }
          
          // Ensure at least 1% if any progress has been made
          if (elapsedDays > 0 || completedLessons > 0) {
            percent = Math.max(1, percent);
          }
        } else {
          // For custom plans, use completed lessons / total lessons
          percent = totalLessons > 0 
            ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
            : 0;
        }
        
        const daysRemaining = Math.max(0, studyPlan.days - elapsedDays);
        const finishDate = new Date(start.getTime() + (studyPlan.days - 1) * 24 * 60 * 60 * 1000);
        
        setPlanStats({
          percent,
          elapsedDays,
          daysRemaining,
          finishDate: finishDate.toISOString(),
          startDate: studyPlan.startDate,
        });
      } catch (error) {
        console.error('Error calculating progress:', error);
        // Fallback to time-based progress
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
      }
      
      // Calculate today's readings if plan is not 365 days
      if (studyPlan.days !== 365 && studyPlan.schedule && studyPlan.schedule.length > 0) {
        const dayIndex = Math.max(0, Math.min(studyPlan.days - 1, diff));
        const todayDayIds = studyPlan.schedule[dayIndex] || [];
        
        // Find reading IDs that match today's day IDs
        const todayIds = new Set();
        bibleReadings.forEach(reading => {
          if (todayDayIds.includes(reading.day)) {
            todayIds.add(reading.id);
          }
        });
        setTodaysReadingIds(todayIds);
      } else {
        setTodaysReadingIds(new Set());
      }
      
      // Calculate reading stats and encouragement
      // Priority 1: Challenge start message (handled in savePlan)
      // Other notifications will be shown only if plan didn't just change
      if (!planJustChanged) {
        calculateReadingStats();
      }
    };
    
    updatePlanStats();
  }, [studyPlan, bibleReadings, progressMap, completedStudies, planJustChanged]);

  if (loading && bibleReadings.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }


  const handleRequestUnlock = (item, index, previousItem) => {
    setUnlockModalVisible(true);
  };

  return (
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Video Background */}
      <VideoBackground />

      {/* Encouragement Message Banner */}
      {encouragementMessage && (
        <View style={[
          styles.encouragementBanner,
          encouragementMessage.type === 'sad' && styles.encouragementBannerSad,
          encouragementMessage.type === 'happy' && styles.encouragementBannerHappy,
        ]}>
          <Text style={styles.encouragementEmoji}>{encouragementMessage.emoji}</Text>
          <Text style={styles.encouragementText}>{encouragementMessage.text}</Text>
          <TouchableOpacity
            onPress={() => setEncouragementMessage(null)}
            style={styles.encouragementClose}
          >
            <Ionicons name="close" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal removed - using banner notification instead for being ahead */}

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>
              Loading journey...
            </Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.text.light} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
          Bible Studies
        </Text>
        <TouchableOpacity 
          style={[styles.headerActionButton, showSearch && styles.headerActionButtonActive]} 
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons 
            name="search" 
            size={dimensions.iconSize.medium} 
            color={COLORS.text.light}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            <TextInput
              style={[styles.searchInput, { fontSize: dimensions.fontSize.body }]}
              placeholder="Search studies..."
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
                <Ionicons name="close" size={dimensions.iconSize.small} color={COLORS.text.light} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filter Bar with Modal Buttons */}
      <View style={styles.filterBar}>
        {/* Types Filter Button */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setTypeFilterModalVisible(true)}
        >
          <Ionicons name="book-outline" size={14} color={COLORS.text.light} />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
          </Text>
        </TouchableOpacity>

        {/* Study Plan Button */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setPlanModalVisible(true)}
        >
          <Ionicons name="time-outline" size={14} color={COLORS.text.light} />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {studyPlan ? `${studyPlan.days}d` : 'Plan'}
          </Text>
        </TouchableOpacity>
      </View>

      
      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {displayItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="rgba(247, 240, 227, 0.3)" />
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                {selectedType === 'pickupbook' ? 'No books found' : 'No studies found'}
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                {selectedType === 'pickupbook' ? 'Try searching for a different book' : 'Start your Bible study journey today'}
              </Text>
            </View>
          ) : (
            <>
              {/* Lessons per day separator - only show if plan is not 365 days */}
              {studyPlan && studyPlan.days !== 365 && selectedType !== 'pickupbook' && (
                <View style={styles.lessonsPerDaySeparator}>
                  <View style={styles.separatorLine} />
                  <View style={styles.lessonsPerDayContainer}>
                    <Ionicons name="calendar" size={16} color={COLORS.accent} />
                    <Text style={styles.lessonsPerDayText}>
                      {Math.ceil((bibleReadings?.length || 0) / studyPlan.days)} lessons per day
                    </Text>
                  </View>
                  <View style={styles.separatorLine} />
                </View>
              )}
              <VerticalGameMap
                items={displayItems}
                progressMap={progressMap}
                completedSet={completedStudies}
                onPressItem={selectedType === 'pickupbook' ? handleNavigateToBook : handleNavigateToStudy}
                onRequestUnlock={handleRequestUnlock}
                todaysReadingIds={todaysReadingIds}
              />
            </>
          )}
        </ScrollView>

        {/* Plan Summary Bar - Now at bottom */}
        {studyPlan && (
          <View style={styles.planSummaryBottom}>
            <View style={styles.planSummaryContent}>
              <View style={styles.planInfoLeft}>
                <Text style={styles.planTitle}>Your Journey</Text>
                <Text style={styles.planSubtitle}>
                  {planStats.daysRemaining}d remaining • {planStats.percent}% complete
                </Text>
              </View>
              <View style={styles.planStatsRight}>
                <View style={styles.planPercentBadge}>
                  <Text style={styles.planPercentText}>{planStats.percent}%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.planProgressBar}>
              <View style={[styles.planProgressFill, { width: `${planStats.percent}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* Study Plan Modal */}
      <StudyPlanModal
        visible={planModalVisible}
        onClose={() => setPlanModalVisible(false)}
        planDays={planDays}
        startDate={startDate}
        onSavePlan={savePlan}
        bibleReadingsCount={bibleReadings?.length || 365}
      />

      {/* Types Filter Modal */}
      <TypeFilterModal
        visible={typeFilterModalVisible}
        onClose={() => setTypeFilterModalVisible(false)}
        selectedType={selectedType}
        onSelectType={handleTypeFilter}
      />

      {/* Unlock Modal */}
      <UnlockModal
        visible={unlockModalVisible}
        onClose={() => setUnlockModalVisible(false)}
      />
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default BibleStudyApp;