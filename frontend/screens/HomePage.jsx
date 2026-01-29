import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, Modal, ScrollView, Animated } from 'react-native';
import styles from '../styles/HomePage.styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av'; 
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import AuthModal from '../components/AuthModal';
import { fetchRandomStudy } from '../api/bibleReadingService'; 
import SharedPreferences from 'react-native-shared-preferences'; 

const HomePage = () => {
  const navigation = useNavigation();
  const verseCardRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  // Copy verse to clipboard
  const handleCopyVerse = () => {
    if (verse) {
      Clipboard.setStringAsync(`"${verse.text}"\n${verse.reference}`);
      Alert.alert('Copied!', 'Verse copied to clipboard.');
    }
  };

  // Share verse card as image
  const handleShareVerse = async () => {
    try {
      setIsSharing(true); // Hide buttons
      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const uri = await verseCardRef.current.capture();
      setIsSharing(false); // Show buttons again
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available', 'Cannot share image on this device.');
      }
    } catch (error) {
      setIsSharing(false);
      Alert.alert('Error', 'Could not share verse.');
    }
  };
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load verse of the day
    fetch('https://beta.ourmanna.com/api/v1/get?format=json')
      .then(res => res.json())
      .then(data => {
        setVerse(data.verse.details);
        setLoading(false);

        // Save verse for widget
        SharedPreferences.setItem(
          'verseOfTheDay',
          JSON.stringify(data.verse.details)
        );
      })
      .catch(() => setLoading(false));

    // Load today's challenge (random bible study)
    loadTodaysChallenge();
    checkUserAuth();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkUserAuth();
      
      // Always reload challenge when screen comes into focus
      const reloadChallenge = async () => {
        try {
          // Force a fresh load to ensure sync with BibleStudyPage
          await loadTodaysChallenge();
        } catch (error) {
        }
      };
      
      reloadChallenge();
    }, []) // Empty dependency array - reload every time screen comes into focus
  );

  // Wave animation effect
  useEffect(() => {
    const animateWave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateWave();
  }, [waveAnim]);

// Calculate overall progress (all completed lessons / total lessons)
const calculateOverallProgress = async () => {
  try {
    const readingsStr = await AsyncStorage.getItem('bibleReadings');
    const completedData = await AsyncStorage.getItem('completedStudies');
    
    if (!readingsStr) {
      return 0;
    }
    
    const allReadings = JSON.parse(readingsStr);
    const totalLessons = allReadings.length;
    
    if (totalLessons === 0) {
      return 0;
    }
    
    const completedIds = completedData ? JSON.parse(completedData) : [];
    const completedLessons = completedIds.length;
    
    // Calculate percent based on actual progress (completed lessons / total lessons)
    const percent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
    
    return percent;
  } catch (error) {
    return 0;
  }
};

  const loadTodaysChallenge = async () => {
  try {
    setChallengeLoading(true);
    
    const today = new Date().toDateString();
    
    // First, check if there's a study plan
    const studyPlanStr = await AsyncStorage.getItem('studyPlan');
    const studyPlan = studyPlanStr ? JSON.parse(studyPlanStr) : null;
    
    let todayReading = null;
    
    // If study plan exists, get today's reading from schedule (SAME AS BIBLESTUDYPAGE)
    if (studyPlan && studyPlan.schedule && studyPlan.startDate) {
      const start = new Date(studyPlan.startDate);
      const now = new Date();
      
      // Calculate days elapsed since start - EXACT SAME LOGIC AS BIBLESTUDYPAGE
      const diff = Math.floor(
        (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - 
         Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) 
        / (1000 * 60 * 60 * 24)
      );
      
      // Get the day index within the plan
      const dayIndex = Math.max(0, Math.min(studyPlan.days - 1, diff));
      const todayReadingIds = studyPlan.schedule[dayIndex] || [];
      
      // Get all readings from AsyncStorage
      const readingsStr = await AsyncStorage.getItem('bibleReadings');
      const allReadings = readingsStr ? JSON.parse(readingsStr) : [];
      
      // Find today's FIRST reading based on schedule
      if (todayReadingIds.length > 0) {
        const firstDayId = todayReadingIds[0];
        todayReading = allReadings.find(r => r.day === firstDayId);
      }
    }
    
    // If no study plan or no reading found, fall back to cached or random
    if (!todayReading) {
      const cachedChallenge = await AsyncStorage.getItem('todaysChallenge');
      const cachedDate = await AsyncStorage.getItem('challengeDate');
      
      if (cachedChallenge && cachedDate === today) {
        todayReading = JSON.parse(cachedChallenge);
      } else {
        // Fetch new random study as fallback
        todayReading = await fetchRandomStudy();
      }
    }
    
    // Load progress for the reading
    const bibleProgress = await AsyncStorage.getItem('bibleProgress');
    const completedStudies = await AsyncStorage.getItem('completedStudies');
    
    // Check if completed - prioritize completion status
    let isCompleted = false;
    if (completedStudies) {
      const completedSet = new Set(JSON.parse(completedStudies));
      isCompleted = completedSet.has(todayReading.id);
    }
    
    // Also check progress map for completion (100% = completed)
    let studyProgress = undefined;
    if (bibleProgress) {
      const progressMap = JSON.parse(bibleProgress);
      studyProgress = progressMap[todayReading.id];
      if (studyProgress === 100) {
        isCompleted = true;
      }
    }
    
    // Calculate overall progress (all completed lessons / total lessons)
    const overallProgressPercent = await calculateOverallProgress();
    
    // Set progress - use overall progress instead of just today's challenge progress
    let finalProgress = null;
    if (isCompleted) {
      // If today's challenge is completed, use overall progress (which includes this completion)
      finalProgress = {
        studyId: todayReading.id,
        percent: overallProgressPercent, // Use overall progress
        lastUpdated: Date.now(),
        completed: true,
        isOverallProgress: true // Flag to indicate this is overall progress
      };
    } else if (studyProgress !== undefined) {
      // If in progress, use overall progress (which accumulates all completed lessons)
      finalProgress = {
        studyId: todayReading.id,
        percent: overallProgressPercent, // Use overall progress
        lastUpdated: Date.now(),
        completed: false,
        isOverallProgress: true // Flag to indicate this is overall progress
      };
    } else {
      // No progress yet, but still show overall progress
      finalProgress = {
        studyId: todayReading.id,
        percent: overallProgressPercent, // Use overall progress
        lastUpdated: Date.now(),
        completed: false,
        isOverallProgress: true // Flag to indicate this is overall progress
      };
    }
    
    setTodaysChallenge({
      ...todayReading,
      progress: finalProgress,
      isCompleted: isCompleted
    });
    
    // Cache the challenge for today
    await AsyncStorage.setItem('todaysChallenge', JSON.stringify(todayReading));
    await AsyncStorage.setItem('challengeDate', today);
    
    // Save progress if exists
    if (finalProgress) {
      await AsyncStorage.setItem('challengeProgress', JSON.stringify(finalProgress));
      await AsyncStorage.setItem('challengeProgressDate', today);
    } else {
      // Clear previous progress if new challenge
      await AsyncStorage.removeItem('challengeProgress');
      await AsyncStorage.removeItem('challengeProgressDate');
    }
  } catch (error) {
    setTodaysChallenge({
      title: "Share God's love with someone today",
      category: { name: 'Daily Challenge' },
      progress: null
    });
  } finally {
    setChallengeLoading(false);
  }
};

  const checkUserAuth = async () => {
    try {
      setAuthLoading(true);
      
      // Check if user is authenticated
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      
      if (isAuthenticated === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsConnected(true);
      } else {
        setUser(null);
        setIsConnected(false);
      }
    } catch (error) {
      setUser(null);
      setIsConnected(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Re-check authentication after modal closes
    checkUserAuth();
  };

  // Helper function to check auth before navigation
  const handleAuthenticatedAction = (action) => {
    if (isConnected) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleJournalPress = () => {
    handleAuthenticatedAction(() => {
      navigation.navigate('Journal');
    });
  };

  const handleChallengePress = () => {
    handleAuthenticatedAction(() => {
      // Navigate to BibleStudyPage
      navigation.navigate('BibleStudy');
    });
  };

  const handleProgressPress = (e) => {
    e.stopPropagation(); // Prevent triggering challenge press
    setShowProgressModal(true);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#A07553" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {isConnected && user ? (
            <>
              <TouchableOpacity 
                style={styles.profileCircle}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileInitial}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hello, {user.name || 'User'}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.greeting}>Welcome to BibleSnap</Text>
          )}
        </View>
        
        {/* Show bell icon and logout when connected, login/register buttons when not */}
        {isConnected ? (
          <View style={styles.connectedActions}>
            
          </View>
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Verse of the Day Card with Video Background */}
  <ViewShot ref={verseCardRef} options={{ format: 'png', quality:0.9 }} style={styles.verseCard}>
          {/* Show video when not sharing, image when sharing */}
          {!isSharing ? (
            <Video
              source={require('../assets/view.mp4')}
              style={styles.backgroundVideo}
              shouldPlay
              isLooping
              isMuted
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../assets/images/img4.jpg')}
              style={styles.backgroundVideo}
              resizeMode="cover"
            />
          )}
          {/* Overlay for better text readability */}
          {!isSharing && <View style={styles.videoOverlay} />}
          
          <View style={styles.verseContent}>
            <View style={styles.verseHeader}>
              <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
              <Text style={styles.verseDate}>{new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</Text>
            </View>
            
            {loading ? (
              <View style={styles.verseLoadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.verseLoadingText}>Loading today's verse...</Text>
              </View>
            ) : verse ? (
              <View style={styles.verseTextContainer}>
                <Text style={styles.verseText}>
                  "{verse.text}"
                </Text>
                <View style={styles.verseRefContainer}>
                  <Text style={styles.verseRef}>{verse.reference}</Text>
                </View>
                {/* Icons row just under the verse */}
                {!isSharing && (
                  <View style={styles.verseIconRow}>
                    <TouchableOpacity onPress={handleCopyVerse} style={styles.iconButtonRow}>
                      <Ionicons name="copy-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShareVerse} style={styles.iconButtonRow}>
                      <Ionicons name="share-social-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.verseErrorContainer}>
                <Text style={styles.verseErrorText}>Could not load verse.</Text>
                <Text style={styles.verseErrorSubtext}>Please check your connection</Text>
              </View>
            )}
          </View>
  </ViewShot>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={[styles.quickActionCard, styles.prayerCard]}
            onPress={() => navigation.navigate('BooksList')}
          >
            <Text style={styles.quickActionIcon}>📖</Text>
            <Text style={styles.quickActionTitle}>Read Bible</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, styles.studyCard]}
            onPress={handleJournalPress}
          >
            <Text style={styles.quickActionIcon}>✍️</Text>
            <Text style={styles.quickActionTitle}>Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, styles.assistantCard]}
           onPress={() => navigation.navigate('BibleStudy')}
           >
            <Text style={styles.quickActionIcon}>🎓</Text>
            <Text style={styles.quickActionTitle}>Bible study</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Challenge */}
        <TouchableOpacity 
          style={[
            styles.challengeCard,
            todaysChallenge?.isCompleted && styles.challengeCardCompleted
          ]} 
          onPress={handleChallengePress}
        >
          {/* Animated Wave Background */}
          <View style={styles.waveContainer}>
            {[0, 1, 2, 3].map((index) => {
              const translateX = waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-300 + (index * 150), 300 + (index * 150)],
              });
              const translateY = waveAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, -20, 0],
              });
              const opacity = waveAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.2, 0.1],
              });
              const scale = waveAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.1, 1],
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.wave,
                    {
                      transform: [
                        { translateX },
                        { translateY },
                        { scale },
                      ],
                      opacity,
                      left: -150 + (index * 100),
                    },
                  ]}
                />
              );
            })}
          </View>
          
          <View style={[styles.challengeHeader, { zIndex: 1 }]}>
            <View style={styles.challengeTitleRow}>
              <Text style={styles.challengeTitle}>Today's Challenge</Text>
              {todaysChallenge?.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#4A7742" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </View>
            {todaysChallenge?.category && (
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>{todaysChallenge.category.name}</Text>
              </View>
            )}
          </View>
          
          {challengeLoading ? (
            <View style={[styles.challengeLoadingContainer, { zIndex: 1 }]}>
              <ActivityIndicator size="small" color="#A07553" />
              <Text style={styles.challengeLoadingText}>Loading challenge...</Text>
            </View>
          ) : (
            <>
              <Text style={[
                styles.challengeDesc,
                todaysChallenge?.isCompleted && styles.challengeDescCompleted
              ]}>
                {todaysChallenge?.title || "Share God's love with someone today"}
              </Text>
              {todaysChallenge?.main_verse && (
                <Text style={styles.challengeVerse}>
                  📖 {todaysChallenge.main_verse}
                </Text>
              )}
            </>
          )}
          
         <TouchableOpacity 
          style={styles.progressContainer}
          onPress={handleProgressPress}
          activeOpacity={0.7}
        >
          <View style={[
            styles.progressBar,
            todaysChallenge?.isCompleted && styles.progressBarCompleted
          ]}>
            <View style={[
              styles.progressFill, 
              { 
                width: todaysChallenge?.progress?.percent 
                  ? `${todaysChallenge.progress.percent}%` 
                  : '0%',
                backgroundColor: todaysChallenge?.isCompleted 
                  ? '#4A7742' 
                  : '#A07553'
              }
            ]} />
          </View>
          <View style={styles.progressTextRow}>
            {todaysChallenge?.isCompleted ? (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#4A7742" />
                <Text style={[styles.progressText, styles.progressTextCompleted]}>
                  Completed! 🎉
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.progressText}>
                  {todaysChallenge?.progress?.percent 
                    ? `${todaysChallenge.progress.percent}% Complete` 
                    : 'Start'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#9E795D" />
              </>
            )}
          </View>
        </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={handleAuthModalClose}
        navigation={navigation}
          onAuthenticated={() => {
          setShowAuthModal(false);
        }}
      />

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
              <Ionicons name="stats-chart" size={32} color="#A07553" />
              <Text style={styles.progressModalTitle}>Challenge Progress</Text>
              <TouchableOpacity 
                style={styles.progressModalCloseButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Ionicons name="close" size={24} color="#9E795D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.progressModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.progressModalSection}>
                <Text style={styles.progressModalSectionTitle}>Today's Challenge</Text>
                <Text style={styles.progressModalChallengeTitle}>
                  {todaysChallenge?.title || "Share God's love with someone today"}
                </Text>
                {todaysChallenge?.category && (
                  <View style={styles.progressModalCategory}>
                    <Text style={styles.progressModalCategoryText}>
                      {todaysChallenge.category.name}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.progressModalSection}>
                <View style={styles.progressModalStatsRow}>
                  <View style={styles.progressModalStatItem}>
                    <Ionicons name="checkmark-circle" size={28} color={todaysChallenge?.isCompleted ? "#4A7742" : "#9E795D"} />
                    <Text style={styles.progressModalStatValue}>
                      {todaysChallenge?.isCompleted ? "Completed" : "In Progress"}
                    </Text>
                  </View>
                  <View style={styles.progressModalStatItem}>
                    <Ionicons name="bar-chart" size={28} color="#A07553" />
                    <Text style={styles.progressModalStatValue}>
                      {todaysChallenge?.progress?.percent || 0}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressModalSection}>
                <Text style={styles.progressModalSectionTitle}>Progress Bar</Text>
                <View style={styles.progressModalProgressContainer}>
                  <View style={styles.progressModalProgressBar}>
                    <View style={[
                      styles.progressModalProgressFill, 
                      { 
                        width: todaysChallenge?.progress?.percent 
                          ? `${todaysChallenge.progress.percent}%` 
                          : '0%',
                        backgroundColor: todaysChallenge?.isCompleted 
                          ? '#4A7742' 
                          : '#A07553'
                      }
                    ]} />
                  </View>
                  <Text style={styles.progressModalProgressText}>
                    {todaysChallenge?.progress?.percent || 0}% Complete
                  </Text>
                </View>
              </View>

              {todaysChallenge?.main_verse && (
                <View style={styles.progressModalSection}>
                  <Text style={styles.progressModalSectionTitle}>Verse Reference</Text>
                  <View style={styles.progressModalVerseContainer}>
                    <Ionicons name="book" size={20} color="#A07553" />
                    <Text style={styles.progressModalVerseText}>
                      {todaysChallenge.main_verse}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={styles.progressModalActionButton}
                onPress={() => {
                  setShowProgressModal(false);
                  handleChallengePress();
                }}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                <Text style={styles.progressModalActionButtonText}>Continue Challenge</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomePage;