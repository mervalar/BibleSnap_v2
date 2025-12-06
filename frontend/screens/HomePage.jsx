import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av'; 
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
  const [userToken, setUserToken] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(true);

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

    // Check authentication on component mount
    checkUserAuth();
  }, []);

    // Re-check authentication and reload challenge progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkUserAuth();
      
      // Always reload challenge when screen comes into focus
      const reloadChallenge = async () => {
        try {
          // Force a fresh load to ensure sync with BibleStudyPage
          await loadTodaysChallenge();
          
          console.log('HomePage - Challenge reloaded on focus');
        } catch (error) {
          console.error('Error reloading challenge on focus:', error);
        }
      };
      
      reloadChallenge();
    }, []) // Empty dependency array - reload every time screen comes into focus
  );

const loadChallengeProgress = async () => {
  try {
    const today = new Date().toDateString();
    const progress = await AsyncStorage.getItem('challengeProgress');
    const progressDate = await AsyncStorage.getItem('challengeProgressDate');
    
    // Check if we have progress for today
    if (progress && progressDate === today) {
      const progressData = JSON.parse(progress);
      
      // Also check the main bible progress map for consistency
      const bibleProgress = await AsyncStorage.getItem('bibleProgress');
      if (bibleProgress) {
        const progressMap = JSON.parse(bibleProgress);
        const studyProgress = progressMap[progressData.studyId];
        
        // Use the most recent progress
        if (studyProgress !== undefined && studyProgress !== progressData.percent) {
          progressData.percent = studyProgress;
          await AsyncStorage.setItem('challengeProgress', JSON.stringify(progressData));
        }
      }
      
      return progressData;
    }
    return null;
  } catch (error) {
    console.error('Error loading challenge progress:', error);
    return null;
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
      
      console.log('HomePage - Study Plan Info:', {
        startDate: studyPlan.startDate,
        currentDate: now.toISOString(),
        daysElapsed: diff,
        dayIndex: dayIndex,
        todayReadingIds: todayReadingIds,
        totalPlanDays: studyPlan.days
      });
      
      // Get all readings from AsyncStorage
      const readingsStr = await AsyncStorage.getItem('bibleReadings');
      const allReadings = readingsStr ? JSON.parse(readingsStr) : [];
      
      // Find today's FIRST reading based on schedule
      if (todayReadingIds.length > 0) {
        const firstDayId = todayReadingIds[0];
        todayReading = allReadings.find(r => r.day === firstDayId);
        
        console.log('HomePage - Found today\'s reading:', {
          firstDayId,
          readingTitle: todayReading?.title,
          readingId: todayReading?.id
        });
      } else {
        console.log('HomePage - No readings scheduled for today');
      }
    } else {
      console.log('HomePage - No study plan found or invalid plan');
    }
    
    // If no study plan or no reading found, fall back to cached or random
    if (!todayReading) {
      console.log('HomePage - Falling back to cached/random challenge');
      const cachedChallenge = await AsyncStorage.getItem('todaysChallenge');
      const cachedDate = await AsyncStorage.getItem('challengeDate');
      
      if (cachedChallenge && cachedDate === today) {
        todayReading = JSON.parse(cachedChallenge);
        console.log('HomePage - Using cached challenge:', todayReading?.title);
      } else {
        // Fetch new random study as fallback
        todayReading = await fetchRandomStudy();
        console.log('HomePage - Using random study:', todayReading?.title);
      }
    }
    
    // Load progress for the reading
    const bibleProgress = await AsyncStorage.getItem('bibleProgress');
    const completedStudies = await AsyncStorage.getItem('completedStudies');
    
    let finalProgress = null;
    
    if (bibleProgress) {
      const progressMap = JSON.parse(bibleProgress);
      const studyProgress = progressMap[todayReading.id];
      
      if (studyProgress !== undefined) {
        finalProgress = {
          studyId: todayReading.id,
          percent: studyProgress,
          lastUpdated: Date.now()
        };
      }
    }
    
    // Check if completed
    if (completedStudies) {
      const completedSet = new Set(JSON.parse(completedStudies));
      if (completedSet.has(todayReading.id)) {
        finalProgress = {
          studyId: todayReading.id,
          percent: 100,
          lastUpdated: Date.now()
        };
      }
    }
    
    console.log('HomePage - Final challenge state:', {
      readingTitle: todayReading?.title,
      readingId: todayReading?.id,
      progress: finalProgress?.percent || 0
    });
    
    setTodaysChallenge({
      ...todayReading,
      progress: finalProgress
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
    console.error('Error loading today\'s challenge:', error);
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
      const token = await AsyncStorage.getItem('token'); // Add token storage
      
      if (isAuthenticated === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserToken(token);
        setIsConnected(true);
        console.log('User authenticated:', parsedUser);
        console.log('User token:', token);
      } else {
        setUser(null);
        setUserToken(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
      setUserToken(null);
      setIsConnected(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleRegister = () => {
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

  // Safe function for updating today's challenge progress
  const updateChallengeProgress = (percent, studyId) => {
    setTimeout(() => {
      setTodaysChallenge(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          percent,
          studyId,
          lastUpdated: Date.now()
        }
      }));
    }, 0);
  };
  
  const handleChallengePress = () => {
    handleAuthenticatedAction(() => {
      if (todaysChallenge && todaysChallenge.id) {
        // Get the current progress from progressMap
        const currentProgress = todaysChallenge.progress?.percent || 0;
        
        // Navigate to the specific bible study
        navigation.navigate('BibleStudyContent', {
          bibleReading: todaysChallenge,
          progress: currentProgress,
          isChallenge: true, // Mark this as a challenge
          onProgressUpdate: async (percent) => {
            try {
              // Update the challenge progress in AsyncStorage
              const progressData = {
                studyId: todaysChallenge.id,
                percent: percent,
                lastUpdated: Date.now()
              };
              
              const today = new Date().toDateString();
              await AsyncStorage.setItem('challengeProgress', JSON.stringify(progressData));
              await AsyncStorage.setItem('challengeProgressDate', today);
              
              // Also update in the main bible progress map
              const existingProgress = await AsyncStorage.getItem('bibleProgress');
              const progressMap = existingProgress ? JSON.parse(existingProgress) : {};
              progressMap[todaysChallenge.id] = percent;
              await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
              
              // Update completed studies if 100%
              if (percent === 100) {
                const completedData = await AsyncStorage.getItem('completedStudies');
                const completedSet = completedData ? new Set(JSON.parse(completedData)) : new Set();
                completedSet.add(todaysChallenge.id);
                await AsyncStorage.setItem('completedStudies', JSON.stringify([...completedSet]));
              }
              
              // Update local state safely
              setTimeout(() => {
                setTodaysChallenge(prev => ({
                  ...prev,
                  progress: progressData
                }));
              }, 0);
            } catch (error) {
              console.error('Error saving challenge progress:', error);
            }
          }
        });
      } else {
        // Navigate to bible studies list
        navigation.navigate('BibleStudy');
      }
    });
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

      {/* User Info Debug (Remove in production) */}
      {isConnected && userToken && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Token: {userToken?.substring(0, 20)}...</Text>
        </View>
      )}

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
                  <View style={styles.verseDecorator}>
                    <Text style={styles.verseDecoratorText}></Text>
                  </View>
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
            
            <View style={styles.verseActions}>
              {/* <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📖</Text>
                <Text style={styles.actionText}>Read Chapter</Text>
              </TouchableOpacity> */}
            </View>
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

        {/* Spiritual Growth Chart - COMMENTED OUT */}
        {/*
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Your Spiritual Growth</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              <View style={styles.chartLine}>
                <View style={[styles.chartPoint, {left: '10%', bottom: '30%'}]} />
                <View style={[styles.chartPoint, {left: '25%', bottom: '45%'}]} />
                <View style={[styles.chartPoint, {left: '40%', bottom: '35%'}]} />
                <View style={[styles.chartPoint, {left: '55%', bottom: '50%'}]} />
                <View style={[styles.chartPoint, {left: '70%', bottom: '45%'}]} />
                <View style={[styles.chartPoint, {left: '85%', bottom: '60%'}]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Mon</Text>
                <Text style={styles.chartLabel}>Tue</Text>
                <Text style={styles.chartLabel}>Wed</Text>
                <Text style={styles.chartLabel}>Thu</Text>
                <Text style={styles.chartLabel}>Fri</Text>
                <Text style={styles.chartLabel}>Sat</Text>
                <Text style={styles.chartLabel}>Sun</Text>
              </View>
            </View>
          </View>
        </View>
        */}

        {/* Spacer to push challenge card to bottom */}
        <View style={styles.spacer} />

        {/* Today's Challenge - Reduced size and moved to bottom */}
        <TouchableOpacity style={styles.challengeCard} onPress={handleChallengePress}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Today's Challenge</Text>
            {todaysChallenge?.category && (
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>{todaysChallenge.category.name}</Text>
              </View>
            )}
          </View>
          
          {challengeLoading ? (
            <View style={styles.challengeLoadingContainer}>
              <ActivityIndicator size="small" color="#A07553" />
              <Text style={styles.challengeLoadingText}>Loading challenge...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.challengeDesc}>
                {todaysChallenge?.title || "Share God's love with someone today"}
              </Text>
              {todaysChallenge?.main_verse && (
                <Text style={styles.challengeVerse}>
                  📖 {todaysChallenge.main_verse}
                </Text>
              )}
            </>
          )}
          
         <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: todaysChallenge?.progress?.percent 
                  ? `${todaysChallenge.progress.percent}%` 
                  : '0%' 
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {todaysChallenge?.progress?.percent 
              ? `${todaysChallenge.progress.percent}% Complete` 
              : 'Start'}
          </Text>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEDED2',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#A07553',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    backgroundColor: '#A07553',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  connectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIcon: {
    padding: 6,
  },
  bellText: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  loginButton: {
    backgroundColor: '#A07553',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  mainContent: {
    flex: 1,
  },
  verseCard: {
    borderRadius: 20,
    marginBottom: 20,
     minHeight: 420,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay for text readability
  },
  verseContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 18,
  },
  iconButtonRow: {
    backgroundColor: 'rgba(160,117,83,0.85)',
    borderRadius: 22,
    padding: 10,
    marginHorizontal: 6,
    elevation: 2,
  },
  verseLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  verseDate: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verseLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseLoadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
  },
  verseTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  verseText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseRefContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseRef: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseDecorator: {
    marginLeft: 8,
  },
  verseDecoratorText: {
    fontSize: 16,
    color: '#fff',
  },
  verseErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseErrorSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  actionText: {
    color: '#9E795D',
    fontWeight: '600',
    fontSize: 11,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerCard: {
    backgroundColor: '#9E795D',
  },
  studyCard: {
    backgroundColor: '#A07553',
  },
  assistantCard: {
    backgroundColor: '#9E795D',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#EEDED2',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  /* Commented out Spiritual Growth Chart styles
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 0.25,
  },
  chartTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
  },
  chartContainer: {
    flex: 1,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#A07553',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  chartLabel: {
    color: '#9E795D',
    fontSize: 10,
  },
  */
  challengeCard: {
    backgroundColor: '#DDBBA1',
    borderRadius: 16,
    padding: 16, // Reduced from 20
    minHeight: 100, // Reduced from 140
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
  },
  challengeTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14, // Reduced from 16
  },
  challengeBadge: {
    backgroundColor: '#A07553',
    paddingHorizontal: 8, // Reduced from 10
    paddingVertical: 3, // Reduced from 4
    borderRadius: 10, // Reduced from 12
  },
  challengeBadgeText: {
    color: '#fff',
    fontSize: 10, // Reduced from 11
    fontWeight: '600',
  },
  challengeLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  challengeLoadingText: {
    marginLeft: 8,
    color: '#9E795D',
    fontSize: 11, // Reduced from 12
  },
  challengeDesc: {
    color: '#9E795D',
    fontSize: 13, // Reduced from 14
    marginBottom: 8, // Reduced from 12
    lineHeight: 18, // Reduced from 20
  },
  challengeVerse: {
    color: '#9E795D',
    fontSize: 10, // Reduced from 11
    fontStyle: 'italic',
    marginBottom: 12, // Reduced from 16
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Reduced from 12
    marginTop: 'auto',
  },
  progressBar: {
    flex: 1,
    height: 6, // Reduced from 8
    backgroundColor: '#EEDED2',
    borderRadius: 3, 
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#A07553',
    borderRadius: 3, 
  },
  progressText: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 11, // Reduced from 12
  },
});

export default HomePage;