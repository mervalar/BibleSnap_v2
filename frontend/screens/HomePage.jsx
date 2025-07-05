import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthModal from '../components/AuthModal';
import { fetchRandomStudy } from '../api/starksService'; // Import the new service function

const HomePage = () => {
  const navigation = useNavigation();
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
      })
      .catch(() => setLoading(false));

    // Load today's challenge (random bible study)
    loadTodaysChallenge();

    // Check authentication on component mount
    checkUserAuth();
  }, []);

  // Re-check authentication when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkUserAuth();
    }, [])
  );

const loadChallengeProgress = async () => {
  try {
    const today = new Date().toDateString();
    const progress = await AsyncStorage.getItem('challengeProgress');
    const progressDate = await AsyncStorage.getItem('challengeProgressDate');
    
    if (progress && progressDate === today) {
      return JSON.parse(progress);
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
    const cachedChallenge = await AsyncStorage.getItem('todaysChallenge');
    const cachedDate = await AsyncStorage.getItem('challengeDate');
    
    // Load progress
    const progressData = await loadChallengeProgress();
    
    if (cachedChallenge && cachedDate === today) {
      // Use cached challenge if it's from today
      const challenge = JSON.parse(cachedChallenge);
      setTodaysChallenge({
        ...challenge,
        progress: progressData // Add progress data to the challenge
      });
    } else {
      // Fetch new random study
      const randomStudy = await fetchRandomStudy();
      setTodaysChallenge({
        ...randomStudy,
        progress: null // No progress for new challenge
      });
      
      // Cache the challenge for today
      await AsyncStorage.setItem('todaysChallenge', JSON.stringify(randomStudy));
      await AsyncStorage.setItem('challengeDate', today);
      
      // Clear previous progress if it exists
      await AsyncStorage.removeItem('challengeProgress');
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

  const handleChallengePress = () => {
    handleAuthenticatedAction(() => {
      if (todaysChallenge && todaysChallenge.id) {
        // Navigate to the specific bible study
        navigation.navigate('BibleStudyContent', {
          stark: todaysChallenge,
          onProgressUpdate: (percent) => {
            // Update local state when progress changes
            setTodaysChallenge(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                percent
              }
            }));
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
        {/* Verse of the Day Card - Enhanced */}
        <View style={styles.verseCard}>
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
              <ActivityIndicator color="#A07553" size="large" />
              <Text style={styles.verseLoadingText}>Loading today's verse...</Text>
            </View>
          ) : verse ? (
            <View style={styles.verseContent}>
              <Text style={styles.verseText}>
                "{verse.text}"
              </Text>
              <View style={styles.verseRefContainer}>
                <Text style={styles.verseRef}>{verse.reference}</Text>
                <View style={styles.verseDecorator}>
                  <Text style={styles.verseDecoratorText}></Text>
                </View>
              </View>
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

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={[styles.quickActionCard, styles.prayerCard]}
            onPress={() => navigation.navigate('BooksList')}
          >
            <Text style={styles.quickActionIcon}>🔥</Text>
            <Text style={styles.quickActionTitle}>Read Bible</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, styles.studyCard]}
            onPress={handleJournalPress}
          >
            <Text style={styles.quickActionIcon}>📚</Text>
            <Text style={styles.quickActionTitle}>Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, styles.assistantCard]}
           onPress={() => navigation.navigate('BibleStudy')}
           >
            <Text style={styles.quickActionIcon}>👑</Text>
            <Text style={styles.quickActionTitle}>Bible study</Text>
          </TouchableOpacity>
        </View>

        {/* Spiritual Growth Chart */}
        {/* <View style={styles.chartCard}>
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
        </View> */}

        {/* Today's Challenge - Now with Random Bible Study */}
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
    backgroundColor: '#DDBBA1',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    minHeight: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseLabel: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  verseDate: {
    color: '#9E795D',
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
    color: '#9E795D',
    fontSize: 14,
  },
  verseContent: {
    flex: 1,
    justifyContent: 'center',
  },
  verseText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  verseRefContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseRef: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  verseDecorator: {
    marginLeft: 8,
  },
  verseDecoratorText: {
    fontSize: 16,
  },
  verseErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseErrorText: {
    color: '#9E795D',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  verseErrorSubtext: {
    color: '#9E795D',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  challengeCard: {
    backgroundColor: '#DDBBA1',
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
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
    marginBottom: 12,
  },
  challengeTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  challengeBadge: {
    backgroundColor: '#A07553',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeBadgeText: {
    color: '#fff',
    fontSize: 11,
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
    fontSize: 12,
  },
  challengeDesc: {
    color: '#9E795D',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeVerse: {
    color: '#9E795D',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#EEDED2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#A07553',
    borderRadius: 4,
  },
  progressText: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HomePage;