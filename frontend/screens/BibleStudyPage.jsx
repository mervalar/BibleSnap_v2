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
  Modal,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { fetchCategories } from '../api/categoryService';
import { fetchBibleReadings } from '../api/bibleReadingService'; 
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';

let DateTimePicker;
try {
  if (Platform.OS !== 'web') {
    const moduleName = '@react-native-community/datetimepicker';
    DateTimePicker = eval('require')(moduleName).default;
  } else {
    DateTimePicker = ({ value, onChange }) => null;
  }
} catch (e) {
  DateTimePicker = ({ value, onChange }) => null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    imageHeight: isTablet ? 180 : 140,
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

// Updated color palette to match BibleStudyContent
const COLORS = {
  primary: '#8B5D33',
  primaryLight: '#A67C52',
  primaryDark: '#6A4424',
  accent: '#4A6741',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  text: {
    primary: '#2D2417',
    secondary: '#5A4A33',
    tertiary: '#8B7355',
    light: '#F7F0E3',
  },
  border: {
    light: '#E7DBC8',
    medium: '#CCBDA6',
  },
  semantic: {
    success: '#4A7742',
    warning: '#FF9800',
    error: '#F44336',
  },
  overlay: 'rgba(45, 36, 23, 0.75)',
  locked: '#D0D0D0',
};

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
const VerticalGameMap = ({ items, progressMap, completedSet, onPressItem, onRequestUnlock }) => {
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
          const label = item.day ? `Day ${item.day}` : (item.title || `#${item.id}`);
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
            nodeColor = COLORS.semantic.success;
            iconName = 'checkmark';
            iconColor = '#FFFFFF';
          } else if (isCurrent) {
            nodeColor = COLORS.primary;
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
                {/* Outer pulsing ring for current node */}
                {isCurrent && (
                  <Animated.View
                    style={[
                      styles.currentNodeRing,
                      {
                        transform: [{ scale: popAnim }],
                        borderColor: nodeColor,
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
                        { scale: isCurrent ? pulseAnim : 1 },
                        { perspective: 1000 },
                        { rotateX: '15deg' },
                      ],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 15,
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
                    {item.title || (item.theme ? item.theme : '')}
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
  const [categories, setCategories] = useState([]);
  const [bibleReadings, setBibleReadings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());

  // Study plan state
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [planDays, setPlanDays] = useState(365);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [planStats, setPlanStats] = useState({
    percent: 0,
    elapsedDays: 0,
    daysRemaining: 0,
    finishDate: null,
    startDate: null,
  });

  // Unlock modal state
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState(null);

  // Dropdown states
  const [showReadingTypeDropdown, setShowReadingTypeDropdown] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedCategories, fetchedBibleReadings] = await Promise.all([
          fetchCategories(),
          fetchBibleReadings()
        ]);

        setBibleReadings(fetchedBibleReadings);

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

  const filteredReadings = bibleReadings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      (item.theme && item.theme === selectedCategory) ||
      (item.category && item.category.id === selectedCategory);
    const matchesSearch = searchQuery === '' || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowReadingTypeDropdown(false);
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
    setShowDaysDropdown(false);
  };

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

  useEffect(() => {
    if (!studyPlan || !bibleReadings || bibleReadings.length === 0) {
      setPlanStats(prev => ({...prev, percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null}));
      return;
    }
    const start = new Date(studyPlan.startDate);
    const now = new Date();
    const diff = Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) - Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())) / (1000*60*60*24));
    const elapsedDays = Math.max(0, Math.min(studyPlan.days, diff + 1));
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

  if (loading && bibleReadings.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }

  const formatDate = (d) => {
    if (!d) return '-';
    const date = (typeof d === 'string') ? new Date(d) : d;
    return date.toLocaleDateString();
  };

  const handleRequestUnlock = (item, index, previousItem) => {
    setUnlockTarget({ item, index, previousItem });
    setUnlockModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Video Background */}
      <VideoBackground />

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

      {/* Filter Bar with Dropdowns */}
      <View style={styles.filterBar}>
        {/* Reading Type Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              setShowReadingTypeDropdown(!showReadingTypeDropdown);
              setShowDaysDropdown(false);
            }}
          >
            <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.text.light} />
            <Text style={styles.dropdownButtonText}>
              {selectedCategory === 'all' ? 'All Types' : categories.find(c => c.id === selectedCategory)?.name || 'Type'}
            </Text>
            <Ionicons name={showReadingTypeDropdown ? "chevron-up" : "chevron-down"} size={dimensions.iconSize.small} color={COLORS.text.light} />
          </TouchableOpacity>
          
          {showReadingTypeDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[styles.dropdownItem, selectedCategory === 'all' && styles.dropdownItemActive]}
                onPress={() => handleCategoryFilter('all')}
              >
                <Text style={[styles.dropdownItemText, selectedCategory === 'all' && styles.dropdownItemTextActive]}>
                  All Types
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.dropdownItem, selectedCategory === cat.id && styles.dropdownItemActive]}
                  onPress={() => handleCategoryFilter(cat.id)}
                >
                  <Text style={[styles.dropdownItemText, selectedCategory === cat.id && styles.dropdownItemTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Days Plan Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              setShowDaysDropdown(!showDaysDropdown);
              setShowReadingTypeDropdown(false);
            }}
          >
            <Ionicons name="calendar-outline" size={dimensions.iconSize.small} color={COLORS.text.light} />
            <Text style={styles.dropdownButtonText}>
              {studyPlan ? `${studyPlan.days}d` : 'Plan'}
            </Text>
            <Ionicons name={showDaysDropdown ? "chevron-up" : "chevron-down"} size={dimensions.iconSize.small} color={COLORS.text.light} />
          </TouchableOpacity>
          
          {showDaysDropdown && (
            <View style={styles.dropdownMenu}>
              {[365, 180, 120, 90, 60, 30].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dropdownItem, studyPlan?.days === d && styles.dropdownItemActive]}
                  onPress={() => {
                    setPlanDays(d);
                    setPlanModalVisible(true);
                  }}
                >
                  <Text style={[styles.dropdownItemText, studyPlan?.days === d && styles.dropdownItemTextActive]}>
                    {d} Days Plan
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredReadings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="rgba(247, 240, 227, 0.3)" />
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                No studies found
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                Start your Bible study journey today
              </Text>
            </View>
          ) : (
            <VerticalGameMap
              items={filteredReadings}
              progressMap={progressMap}
              completedSet={completedStudies}
              onPressItem={handleNavigateToStudy}
              onRequestUnlock={handleRequestUnlock}
            />
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
      <Modal
        visible={planModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="calendar" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Choose Your Journey</Text>
            <Text style={styles.modalSubtitle}>Select a reading plan duration</Text>
            
            <View style={{ marginBottom:16 }}>
              <Text style={styles.modalLabel}>Start Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
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
            
            {[365, 180, 120, 90, 60, 30].map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  setPlanDays(d);
                  savePlan(d);
                }}
                style={[styles.planOption, planDays===d && styles.planOptionActive]}
              >
                <View style={styles.planOptionContent}>
                  <Text style={[styles.planOptionText, planDays===d && styles.planOptionTextActive]}>
                    {d} Days Plan
                  </Text>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={planDays===d ? '#FFF' : COLORS.border.medium} 
                  />
                </View>
                <Text style={[styles.planOptionSubtext, planDays===d && styles.planOptionSubtextActive]}>
                  {Math.ceil((bibleReadings?.length || 365)/d)} reading(s) per day
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              onPress={() => setPlanModalVisible(false)} 
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unlock Modal */}
      <Modal
        visible={unlockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnlockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="lock-closed" size={48} color={COLORS.semantic.warning} style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Lesson Locked</Text>
            <Text style={styles.modalSubtitle}>
              Complete the previous lesson to unlock this one
            </Text>

            {unlockTarget?.previousItem ? (
              <>
                <View style={styles.unlockInfo}>
                  <Text style={styles.unlockLabel}>Previous Lesson:</Text>
                  <Text style={styles.unlockValue}>
                    {unlockTarget.previousItem.title || `Day ${unlockTarget.previousItem.day || unlockTarget.previousItem.id}`}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    onPress={() => setUnlockModalVisible(false)} 
                    style={styles.modalButton}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setUnlockModalVisible(false);
                      handleNavigateToStudy(unlockTarget.previousItem, progressMap[unlockTarget.previousItem.id] || 0);
                    }}
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Go There</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity 
                onPress={() => setUnlockModalVisible(false)} 
                style={[styles.modalButton, styles.modalButtonPrimary, { marginTop: 20 }]}
              >
                <Text style={styles.modalButtonPrimaryText}>Understood</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.background,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontWeight: '800',
    color: COLORS.text.light,
    letterSpacing: 0.5,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerActionButtonActive: {
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text.light,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownButtonText: {
    flex: 1,
    color: COLORS.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dropdownItemTextActive: {
    color: '#FFF',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  planSummaryBottom: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  planSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planInfoLeft: {
    flex: 1,
  },
  planTitle: {
    fontWeight: '700',
    color: COLORS.text.light,
    fontSize: 16,
    marginBottom: 4,
  },
  planSubtitle: {
    color: 'rgba(247, 240, 227, 0.8)',
    fontSize: 12,
  },
  planStatsRight: {
    alignItems: 'flex-end',
  },
  planPercentBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planPercentText: {
    fontWeight: '700',
    color: '#FFF',
    fontSize: 16,
  },
  planProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  gameMapWrap: {
    flex: 1,
  },
  journeyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 20, // Add space for bottom bar
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 150,
    position: 'relative',
    marginVertical: 0,
  },
  nodeTouchable: {
    alignItems: 'center',
    position: 'relative',
  },
  nodeExternalShadow: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 25,
    top: 10,
    left: 36,
    opacity: 0.25,
    zIndex: -1,
  },
  currentNodeRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    top: -10,
    opacity: 0.3,
    zIndex: 0,
  },
  nodeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  nodeInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 1,
  },
  nodeLabelContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: 140,
  },
  nodeLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  nodeSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '700',
    color: COLORS.text.light,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(247, 240, 227, 0.8)',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  modalLabel: {
    color: COLORS.text.secondary,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  dateButtonText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  planOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  planOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  planOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planOptionText: {
    color: COLORS.text.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  planOptionTextActive: {
    color: '#FFF',
  },
  planOptionSubtext: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  planOptionSubtextActive: {
    color: '#FFF',
    opacity: 0.9,
  },
  unlockInfo: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    width: '100%',
  },
  unlockLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  unlockValue: {
    color: COLORS.text.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  modalButtonPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 10,
  },
  modalCloseText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});

export default BibleStudyApp;