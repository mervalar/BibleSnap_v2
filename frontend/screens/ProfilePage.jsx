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
      setWeekTotal(weekData.reduce((sum, val) => sum + val, 0));
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
      
      setStudyPlanSummary({
        days: plan.days,
        percent,
        daysRemaining,
        finishDate: finishDate.toISOString(),
        startDate: plan.startDate,
        totalLessons,
        completedLessons,
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
            <View>
              <Text style={styles.chartTitle}>Spiritual Growth</Text>
              <Text style={styles.chartSubtitle}>
                Last 7 days • {weekTotal} lessons completed
              </Text>
            </View>
            {currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons 
                  name={currentStreak >= 3 ? "trending-up" : "flame"} 
                  size={dimensions.iconSize.small} 
                  color={COLORS.text.light} 
                />
                <Text style={styles.streakText}>
                  {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.chartArea}>
            <View style={styles.chartLine}>
              {weeklyProgress.map((value, index) => {
                const maxValue = Math.max(...weeklyProgress, 1);
                const bottomPercent = (value / maxValue) * 60;
                const leftPercent = (index / 6) * 85 + 7.5;
                
                return value > 0 ? (
                  <View 
                    key={index}
                    style={[
                      styles.chartPoint, 
                      {
                        left: `${leftPercent}%`, 
                        bottom: `${20 + bottomPercent}%`,
                      }
                    ]} 
                  />
                ) : null;
              })}
            </View>
            
            <View style={styles.chartLabels}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <View key={day} style={styles.chartLabelContainer}>
                  <Text style={[
                    styles.chartLabel,
                    weeklyProgress[index] > 0 && styles.chartLabelActive
                  ]}>
                    {day}
                  </Text>
                  {weeklyProgress[index] > 0 && (
                    <View style={styles.chartDot}>
                      <Text style={styles.chartDotText}>{weeklyProgress[index]}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
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
  chartSubtitle: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 12,
  },
  streakText: {
    marginLeft: dimensions.spacing.xs,
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.light,
    fontWeight: '600',
  },
  chartArea: {
    height: 160,
  },
  chartLine: {
    flex: 1,
    position: 'relative',
    height: 120,
  },
  chartPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dimensions.spacing.sm,
  },
  chartLabelContainer: {
    alignItems: 'center',
    width: 30,
  },
  chartLabel: {
    fontSize: dimensions.fontSize.caption,
    color: COLORS.text.secondary,
  },
  chartLabelActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  chartDot: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDotText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
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
});

export default ProfilePage;