import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { fetchJournals } from '../api/journalApi';
import BottomNavBar from '../components/BottomNavBar';

const { width: screenWidth } = Dimensions.get('window');

// Responsive dimensions helper
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  return {
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

// Color palette
const COLORS = {
  primary: '#8B5D33',
  accent: '#4A6741',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  text: {
    primary: '#2D2417',
    secondary: '#5A4A33',
    light: '#F7F0E3',
  },
  border: {
    light: '#E7DBC8',
    medium: '#CCBDA6',
  },
  semantic: {
    success: '#4A7742',
    error: '#F44336',
    info: '#2196F3',
  },
  overlay: 'rgba(139, 93, 51, 0.1)',
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

const ProfilePage = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Stats
  const [journalCount, setJournalCount] = useState(0);
  const [savedVersesCount, setSavedVersesCount] = useState(0);
  const [studyPlanSummary, setStudyPlanSummary] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [weekAverage, setWeekAverage] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [chartInsight, setChartInsight] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (isAuthenticated === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserToken(token);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load weekly progress data
  const loadWeeklyProgress = async () => {
    try {
      const completedData = await AsyncStorage.getItem('completedStudies');
      const completedIds = completedData ? JSON.parse(completedData) : [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekData = [0, 0, 0, 0, 0, 0, 0];
      
      for (const id of completedIds) {
        const timestamp = await AsyncStorage.getItem(`lesson_${id}_completed_date`);
        if (timestamp) {
          const completedDate = new Date(parseInt(timestamp));
          completedDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 0 && daysDiff < 7) {
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() - daysDiff);
            const targetDayOfWeek = targetDate.getDay();
            const arrayIndex = targetDayOfWeek === 0 ? 6 : targetDayOfWeek - 1;
            weekData[arrayIndex]++;
          }
        }
      }
      
      setWeeklyProgress(weekData);
      
      // Calculate streak
      let streak = 0;
      for (let i = 6; i >= 0; i--) {
        if (weekData[i] > 0) {
          streak++;
        } else if (i < 6) {
          break;
        }
      }
      
      setCurrentStreak(streak);
      const total = weekData.reduce((sum, val) => sum + val, 0);
      setWeekTotal(total);
      setWeekAverage(Math.round((total / 7) * 10) / 10); // Round to 1 decimal
      
      // Generate insights
      const activeDays = weekData.filter(val => val > 0).length;
      const maxDay = Math.max(...weekData);
      const maxDayIndex = weekData.indexOf(maxDay);
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      let insight = null;
      if (total === 0) {
        insight = {
          type: 'motivation',
          emoji: '🌟',
          text: "Start your journey today! Even one lesson makes a difference.",
        };
      } else if (activeDays >= 5) {
        insight = {
          type: 'excellent',
          emoji: '🔥',
          text: `Amazing! You're reading ${activeDays} days this week! Keep the momentum!`,
        };
      } else if (maxDay >= 3) {
        insight = {
          type: 'great',
          emoji: '💪',
          text: `Wow! ${maxDay} lessons on ${dayNames[maxDayIndex]}! You're on fire!`,
        };
      } else if (activeDays >= 3) {
        insight = {
          type: 'good',
          emoji: '✨',
          text: `Good progress! ${activeDays} active days. Try to read every day for best results!`,
        };
      } else {
        insight = {
          type: 'encourage',
          emoji: '📖',
          text: `You've completed ${total} lessons this week. Try to read a bit more each day!`,
        };
      }
      
      setChartInsight(insight);
    } catch (error) {
      console.error('Error loading weekly progress:', error);
    }
  };

  // Load saved verses count
  const loadSavedVersesCount = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const highlightKeys = keys.filter(key => key.startsWith('highlights_'));
      let total = 0;

      for (const key of highlightKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          total += Object.keys(parsed).length;
        }
      }
      setSavedVersesCount(total);
    } catch (error) {
      console.error('Error loading saved verses count:', error);
    }
  };

  // Load journal count
  const loadJournalCount = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const journals = await fetchJournals(parsedUser?.id);
        setJournalCount(journals.length);
      }
    } catch (error) {
      console.error('Failed to load journal count:', error);
    }
  };

  // Load study plan summary
  const loadPlanSummary = async () => {
    try {
      const raw = await AsyncStorage.getItem('studyPlan');
      if (!raw) {
        setStudyPlanSummary(null);
        return;
      }
      
      const plan = JSON.parse(raw);
      if (!plan.days || plan.days <= 0) {
        setStudyPlanSummary(null);
        return;
      }
      
      const progressData = await AsyncStorage.getItem('bibleProgress');
      const progressMap = progressData ? JSON.parse(progressData) : {};
      
      const completedData = await AsyncStorage.getItem('completedStudies');
      const completedIds = completedData ? JSON.parse(completedData) : [];
      const completedSet = new Set(completedIds);
      
      const bibleReadingsData = await AsyncStorage.getItem('bibleReadings');
      let totalLessons = 0;
      let completedLessons = 0;
      
      if (bibleReadingsData) {
        const readings = JSON.parse(bibleReadingsData);
        totalLessons = readings.length;
        
        completedLessons = readings.filter(reading => {
          const progress = progressMap[reading.id] || 0;
          return completedSet.has(reading.id) || progress === 100;
        }).length;
      }
      
      if (totalLessons === 0) {
        setStudyPlanSummary(null);
        return;
      }
      
      const percent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
      const remainingLessons = Math.max(0, totalLessons - completedLessons);
      const lessonsPerDay = totalLessons / plan.days;
      const daysRemaining = lessonsPerDay > 0 
        ? Math.max(0, Math.ceil(remainingLessons / lessonsPerDay))
        : plan.days;
      
      const now = Date.now();
      const finishTimestamp = now + (daysRemaining * 24 * 60 * 60 * 1000);
      const finishDate = new Date(finishTimestamp);
      
      // Calculate lessons ahead/behind
      const start = new Date(plan.startDate);
      const today = new Date();
      const diff = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - 
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.max(0, Math.min(plan.days, diff + 1));
      
      let expectedCompleted = 0;
      if (plan.days !== 365 && plan.schedule) {
        for (let i = 0; i <= Math.min(elapsedDays - 1, plan.schedule.length - 1); i++) {
          expectedCompleted += (plan.schedule[i] || []).length;
        }
      } else {
        expectedCompleted = elapsedDays;
      }
      
      const lessonsAhead = completedLessons - expectedCompleted;
      
      // Calculate consistency (last 7 days)
      const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
      const history = dailyHistory ? JSON.parse(dailyHistory) : {};
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        last7Days.push(history[dateKey] || 0);
      }
      const daysWithReading = last7Days.filter(count => count > 0).length;
      const consistency = Math.round((daysWithReading / 7) * 100);
      
      // Get reading streak
      const streakData = await AsyncStorage.getItem('readingStreak');
      const streak = streakData ? parseInt(streakData, 10) : 0;
      
      setStudyPlanSummary({
        days: plan.days,
        percent,
        daysRemaining,
        finishDate: finishDate.toISOString(),
        startDate: plan.startDate,
        totalLessons,
        completedLessons,
        lessonsAhead,
        consistency,
        streak,
      });
    } catch (error) {
      console.error('Error loading study plan:', error);
      setStudyPlanSummary(null);
    }
  };

  // Update profile
  const handleSaveEdit = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setUpdateLoading(true);
      
      const response = await fetch('https://biblesnap.bellatis.com/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ 
          name: editName.trim(), 
          email: editEmail.trim() 
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        await AsyncStorage.setItem('user', JSON.stringify(responseData.user));
        setUser(responseData.user);
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', responseData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['user', 'isAuthenticated', 'token']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
    );
  };

  // Initial load
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      loadWeeklyProgress();
      loadSavedVersesCount();
      loadJournalCount();
      loadPlanSummary();
    }, [])
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <VideoBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.text.light} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No user state
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <VideoBackground />
        <View style={styles.loadingContainer}>
          <Ionicons name="person-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.errorTitle}>No Profile Found</Text>
          <Text style={styles.errorText}>Unable to load your profile data.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <VideoBackground />

      {/* Loading overlay */}
      {updateLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingOverlayText}>Updating profile...</Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.text.light} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
            setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={dimensions.iconSize.medium} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.statusIndicator} />
          </View>
          
          <Text style={styles.profileName}>{user.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user.email || 'No email'}</Text>
          
          <View style={styles.joinedContainer}>
            <Ionicons name="calendar-outline" size={dimensions.iconSize.small} color={COLORS.text.light} />
            <Text style={styles.joinedText}>Member since March 2024</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="bookmark" size={dimensions.iconSize.large} color={COLORS.primary} />
            <Text style={styles.statNumber}>{savedVersesCount}</Text>
            <Text style={styles.statLabel}>Verses Saved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="journal" size={dimensions.iconSize.large} color={COLORS.semantic.info} />
            <Text style={styles.statNumber}>{journalCount}</Text>
            <Text style={styles.statLabel}>Journals</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={dimensions.iconSize.large} color={COLORS.primary} />
            <Text style={styles.statNumber}>
              {studyPlanSummary ? `${studyPlanSummary.percent}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>Plan Progress</Text>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Weekly Reading Progress</Text>
              <View style={styles.chartStatsRow}>
                <View style={styles.chartStatItem}>
                  <Ionicons name="book" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.chartStatText}>{weekTotal} lessons</Text>
                </View>
                <View style={styles.chartStatItem}>
                  <Ionicons name="trending-up" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.chartStatText}>{weekAverage}/day avg</Text>
                </View>
                {currentStreak > 0 && (
                  <View style={styles.chartStatItem}>
                    <Ionicons name="flame" size={14} color={COLORS.primary} />
                    <Text style={[styles.chartStatText, { color: COLORS.primary, fontWeight: '700' }]}>
                      {currentStreak} day streak
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Insight Message */}
          {chartInsight && (
            <View style={[
              styles.chartInsight,
              chartInsight.type === 'excellent' && styles.chartInsightExcellent,
              chartInsight.type === 'great' && styles.chartInsightGreat,
              chartInsight.type === 'good' && styles.chartInsightGood,
              chartInsight.type === 'encourage' && styles.chartInsightEncourage,
            ]}>
              <Text style={styles.chartInsightEmoji}>{chartInsight.emoji}</Text>
              <Text style={styles.chartInsightText}>{chartInsight.text}</Text>
            </View>
          )}
          
          {/* Bar Chart */}
          <View style={styles.chartArea}>
            <View style={styles.barChartContainer}>
              {weeklyProgress.map((value, index) => {
                const maxValue = Math.max(...weeklyProgress, 1);
                const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const isSelected = selectedDayIndex === index;
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.barContainer}
                    onPress={() => {
                      if (value > 0) {
                        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        setSelectedDayData({
                          day: dayNames[index],
                          dayShort: dayNames[index].substring(0, 3),
                          value: value,
                          index: index
                        });
                        setShowProgressModal(true);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.barWrapper}>
                      {/* Bar */}
                      <View style={[
                        styles.bar,
                        { height: `${barHeight}%` },
                        value > 0 && styles.barFilled,
                        isSelected && styles.barSelected,
                      ]}>
                        {value > 0 && (
                          <Text style={styles.barValue}>{value}</Text>
                        )}
                      </View>
                      
                      {/* Average line indicator */}
                      {weekAverage > 0 && value > 0 && (
                        <View style={[
                          styles.averageIndicator,
                          { bottom: `${(weekAverage / maxValue) * 100}%` }
                        ]} />
                      )}
                    </View>
                    
                    {/* Day Label */}
                    <Text style={[
                      styles.barDayLabel,
                      value > 0 && styles.barDayLabelActive,
                      isSelected && styles.barDayLabelSelected,
                    ]}>
                      {dayNames[index]}
                    </Text>
                    
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Average Line */}
            {weekAverage > 0 && (
              <View style={styles.averageLineContainer}>
                <View style={styles.averageLine} />
                <Text style={styles.averageLineLabel}>
                  Avg: {weekAverage}/day
                </Text>
              </View>
            )}
          </View>
          
          {/* Chart Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Lessons completed</Text>
            </View>
            {weekAverage > 0 && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotDashed, { borderColor: COLORS.text.secondary }]} />
                <Text style={styles.legendText}>Daily average</Text>
              </View>
            )}
          </View>
        </View>

        {/* Study Plan Details */}
        {studyPlanSummary && (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Reading Plan Progress</Text>
            <Text style={styles.planSubtitle}>
              {studyPlanSummary.days}-day plan • Started {new Date(studyPlanSummary.startDate).toLocaleDateString()}
            </Text>
            
            <View style={styles.planStats}>
              <View>
                <Text style={styles.planStatLabel}>Completed</Text>
                <Text style={styles.planStatValue}>
                  {studyPlanSummary.completedLessons}/{studyPlanSummary.totalLessons}
                </Text>
              </View>
              <View style={styles.planStatRight}>
                <Text style={styles.planStatLabel}>Days Remaining</Text>
                <Text style={styles.planStatValue}>{studyPlanSummary.daysRemaining}</Text>
              </View>
            </View>
            
            {/* New Stats Row */}
            {studyPlanSummary.lessonsAhead !== undefined && (
              <View style={[styles.planStats, { marginTop: dimensions.spacing.sm }]}>
                <View>
                  <Text style={styles.planStatLabel}>
                    {studyPlanSummary.lessonsAhead >= 0 ? 'Lessons Ahead' : 'Lessons Behind'}
                  </Text>
                  <Text style={[
                    styles.planStatValue,
                    studyPlanSummary.lessonsAhead >= 0 ? { color: COLORS.semantic.success } : { color: COLORS.semantic.error }
                  ]}>
                    {studyPlanSummary.lessonsAhead >= 0 ? '+' : ''}{studyPlanSummary.lessonsAhead}
                  </Text>
                </View>
                {studyPlanSummary.consistency !== undefined && (
                  <View style={styles.planStatRight}>
                    <Text style={styles.planStatLabel}>Consistency</Text>
                    <Text style={styles.planStatValue}>{studyPlanSummary.consistency}%</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Encouragement Message */}
            {studyPlanSummary.consistency !== undefined && (
              <View style={[
                styles.encouragementCard,
                studyPlanSummary.consistency < 30 && styles.encouragementCardSad,
                studyPlanSummary.consistency >= 80 && styles.encouragementCardHappy,
              ]}>
                <Text style={styles.encouragementCardEmoji}>
                  {studyPlanSummary.consistency < 30 ? '😔' : 
                   studyPlanSummary.consistency >= 80 ? '✨' : '📖'}
                </Text>
                <Text style={styles.encouragementCardText}>
                  {studyPlanSummary.consistency < 30 
                    ? "You've been a bit inconsistent. Read more today to achieve your goal!"
                    : studyPlanSummary.consistency >= 80
                    ? "Great consistency! You're doing amazing!"
                    : "Keep going! You're making progress."}
                </Text>
              </View>
            )}
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${studyPlanSummary.percent}%` }]} />
            </View>
            
            <Text style={styles.planFinishText}>
              Est. finish: {new Date(studyPlanSummary.finishDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Menu Section */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Journal')}>
            <View style={styles.menuIcon}>
              <Ionicons name="journal" size={dimensions.iconSize.medium} color={COLORS.semantic.info} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>My Journals</Text>
              <Text style={styles.menuSubtext}>{journalCount} journal entries</Text>
            </View>
            <Ionicons name="chevron-forward" size={dimensions.iconSize.small} color={COLORS.text.light} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
              <Ionicons name="log-out" size={dimensions.iconSize.medium} color={COLORS.semantic.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuText, { color: COLORS.semantic.error }]}>Logout</Text>
              <Text style={styles.menuSubtext}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={updateLoading}>
                <Ionicons name="close" size={dimensions.iconSize.medium} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                editable={!updateLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!updateLoading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={updateLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, updateLoading && styles.disabledButton]}
                onPress={handleSaveEdit}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Progress Details Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModalContent}>
            <View style={styles.progressModalHeader}>
              <Ionicons name="stats-chart" size={32} color={COLORS.primary} />
              <Text style={styles.progressModalTitle}>Daily Progress</Text>
              <TouchableOpacity 
                style={styles.progressModalCloseButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {selectedDayData && (
              <View style={styles.progressModalBody}>
                <View style={styles.progressModalSection}>
                  <View style={styles.progressModalDayHeader}>
                    <Ionicons name="calendar" size={28} color={COLORS.primary} />
                    <Text style={styles.progressModalDayTitle}>{selectedDayData.day}</Text>
                  </View>
                </View>

                <View style={styles.progressModalSection}>
                  <View style={styles.progressModalStatCard}>
                    <Ionicons name="book" size={32} color={COLORS.primary} />
                    <View style={styles.progressModalStatContent}>
                      <Text style={styles.progressModalStatValue}>{selectedDayData.value}</Text>
                      <Text style={styles.progressModalStatLabel}>
                        Lesson{selectedDayData.value !== 1 ? 's' : ''} Completed
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressModalSection}>
                  <Text style={styles.progressModalSectionTitle}>Weekly Comparison</Text>
                  <View style={styles.progressModalComparison}>
                    <View style={styles.progressModalComparisonItem}>
                      <Text style={styles.progressModalComparisonLabel}>This Day</Text>
                      <Text style={styles.progressModalComparisonValue}>
                        {selectedDayData.value} lesson{selectedDayData.value !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={styles.progressModalComparisonDivider} />
                    <View style={styles.progressModalComparisonItem}>
                      <Text style={styles.progressModalComparisonLabel}>Daily Average</Text>
                      <Text style={styles.progressModalComparisonValue}>
                        {weekAverage.toFixed(1)} lesson{weekAverage !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedDayData.value >= weekAverage ? (
                  <View style={styles.progressModalEncouragement}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.semantic.success} />
                    <Text style={styles.progressModalEncouragementText}>
                      Great job! You're above your daily average! 🎉
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.progressModalEncouragement, styles.progressModalEncouragementNeutral]}>
                    <Ionicons name="trending-up" size={24} color={COLORS.primary} />
                    <Text style={styles.progressModalEncouragementText}>
                      Keep going! Try to reach your daily average of {weekAverage.toFixed(1)} lessons.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
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
    backgroundColor: 'rgba(68, 57, 46, 0.74)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.lg,
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.light,
    fontSize: dimensions.fontSize.body,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.light,
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
  },
  errorText: {
    fontSize: dimensions.fontSize.body,
    color: COLORS.text.light,
    textAlign: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  backButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.md,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.background,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontSize: dimensions.fontSize.body,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingTop: dimensions.spacing.lg,
    paddingBottom: dimensions.spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.light,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: dimensions.spacing.lg,
    paddingBottom: dimensions.spacing.xl * 2,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: dimensions.spacing.md,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: dimensions.fontSize.title * 1.5,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.semantic.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileName: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.xs,
  },
  profileEmail: {
    fontSize: dimensions.fontSize.body,
    color: COLORS.text.secondary,
    marginBottom: dimensions.spacing.sm,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 12,
  },
  joinedText: {
    marginLeft: dimensions.spacing.xs,
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginVertical: dimensions.spacing.xs,
  },
  statLabel: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  chartTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  chartStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dimensions.spacing.xs,
    gap: dimensions.spacing.md,
    flexWrap: 'wrap',
  },
  chartStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartStatText: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  chartInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 93, 51, 0.1)',
    borderRadius: 12,
    padding: dimensions.spacing.sm,
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  chartInsightExcellent: {
    backgroundColor: 'rgba(74, 119, 66, 0.15)',
    borderLeftColor: COLORS.semantic.success,
  },
  chartInsightGreat: {
    backgroundColor: 'rgba(139, 93, 51, 0.15)',
    borderLeftColor: COLORS.primary,
  },
  chartInsightGood: {
    backgroundColor: 'rgba(139, 93, 51, 0.1)',
    borderLeftColor: COLORS.primary,
  },
  chartInsightEncourage: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftColor: COLORS.semantic.error,
  },
  chartInsightEmoji: {
    fontSize: 20,
    marginRight: dimensions.spacing.xs,
  },
  chartInsightText: {
    flex: 1,
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.primary,
    fontWeight: '600',
    lineHeight: 16,
  },
  chartArea: {
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: dimensions.spacing.xs,
    marginBottom: dimensions.spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 2,
  },
  barWrapper: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    width: '80%',
    minHeight: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFilled: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  barSelected: {
    backgroundColor: COLORS.accent,
    transform: [{ scaleX: 1.1 }],
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  barValue: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  averageIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.text.secondary,
    borderTopStyle: 'dashed',
    opacity: 0.5,
  },
  barDayLabel: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: dimensions.spacing.xs,
    fontWeight: '500',
  },
  barDayLabelActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  barDayLabelSelected: {
    color: COLORS.accent,
    fontSize: dimensions.fontSize.caption + 1,
  },
  dayTooltip: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dayTooltipText: {
    color: COLORS.background,
    fontSize: dimensions.fontSize.caption,
    fontWeight: '600',
  },
  averageLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dimensions.spacing.sm,
    paddingTop: dimensions.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  averageLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.text.secondary,
    borderStyle: 'dashed',
    marginRight: dimensions.spacing.sm,
    opacity: 0.5,
  },
  averageLineLabel: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: dimensions.spacing.md,
    marginTop: dimensions.spacing.sm,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotDashed: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.lg,
  },
  planTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planSubtitle: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dimensions.spacing.md,
  },
  planStatLabel: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
  },
  planStatValue: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 4,
  },
  planStatRight: {
    alignItems: 'flex-end',
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginTop: dimensions.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  encouragementCardSad: {
    backgroundColor: 'rgba(255, 235, 235, 0.7)',
    borderLeftColor: COLORS.semantic.error,
  },
  encouragementCardHappy: {
    backgroundColor: 'rgba(235, 255, 235, 0.7)',
    borderLeftColor: COLORS.semantic.success,
  },
  encouragementCardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  encouragementCardText: {
    flex: 1,
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginTop: dimensions.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  planFinishText: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: dimensions.spacing.sm,
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: dimensions.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  menuSubtext: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginLeft: 70,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: dimensions.spacing.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: dimensions.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  modalTitle: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  inputContainer: {
    marginBottom: dimensions.spacing.md,
  },
  inputLabel: {
    fontSize: dimensions.fontSize.caption,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: dimensions.spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    fontSize: dimensions.fontSize.body,
    backgroundColor: COLORS.surface,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: dimensions.spacing.lg,
    gap: dimensions.spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: dimensions.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
  },
  cancelButtonText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.background,
  },
  disabledButton: {
    opacity: 0.6,
  },
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressModalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  progressModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  progressModalTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  progressModalCloseButton: {
    padding: 4,
  },
  progressModalBody: {
    padding: 20,
  },
  progressModalSection: {
    marginBottom: 24,
  },
  progressModalDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressModalDayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  progressModalStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  progressModalStatContent: {
    flex: 1,
  },
  progressModalStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  progressModalStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  progressModalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  progressModalComparison: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  progressModalComparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressModalComparisonDivider: {
    width: 1,
    backgroundColor: COLORS.border.light,
  },
  progressModalComparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  progressModalComparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  progressModalEncouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 119, 66, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.semantic.success,
  },
  progressModalEncouragementNeutral: {
    backgroundColor: 'rgba(139, 93, 51, 0.1)',
    borderLeftColor: COLORS.primary,
  },
  progressModalEncouragementText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});

export default ProfilePage;