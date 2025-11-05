import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import SplashScreen from '../components/SplashScreen';
import { Video } from 'expo-av';
// Ensure all dependencies are installed

// Responsive dimensions (matching Journal app)
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 64 : 48, 
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

// Initialize dimensions
const dimensions = getResponsiveDimensions();

// Professional color palette (refined for Bible Study)
const COLORS = {
  primary: '#8B5D33', // Richer brown as primary color
  primaryLight: '#A67C52', // Lighter brown for highlights
  primaryDark: '#6A4424', // Darker brown for shadows and text
  accent: '#4A6741', // Sage green as accent color
  accentLight: '#7D9A73', // Light sage for highlights
  accentDark: '#32472C', // Dark sage for contrast elements
  highlight: '#E2C9A0', // Warm cream highlight color
  
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  card: {
    verse: 'rgba(139, 93, 51, 0.92)',
    explanation: 'rgba(74, 103, 65, 0.92)',
    related: 'rgba(106, 68, 36, 0.92)',
    knowledge: 'rgba(50, 71, 44, 0.92)',
    activity: 'rgba(128, 84, 47, 0.92)',
  },
  text: {
    primary: '#2D2417', // Very dark brown
    secondary: '#5A4A33', // Medium brown
    tertiary: '#8B7355', // Light brown
    light: '#F7F0E3', // Off-white cream for dark backgrounds
  },
  border: {
    light: '#E7DBC8', // Light cream border
    medium: '#CCBDA6', // Medium tan border
    strong: '#A8926D', // Strong brown border
  },
  semantic: {
    success: '#4A7742', // Green with brown undertone
    warning: '#D6A23C', // Warm gold
    error: '#C25B4A', // Earthy red
    info: '#5B87A8', // Muted blue
  },
  overlay: 'rgba(45, 36, 23, 0.65)', // Darker, more opaque overlay
};

// Cross-platform TTS Service
class TTSService {
  constructor() {
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  // Set status change callback
  setOnStatusChange(callback) {
    this.onStatusChange = callback;
  }

  getPlayingStatus() {
    return this.isPlaying;
  }
}

// Video Background Component
const VideoBackground = () => {
  return (
    <View style={styles.sectionVideoBackground}>
      <Video
        source={require('../assets/view.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        muted
        rate={1.0}
        ignoreSilentSwitch="obey"
      />
    </View>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { fontSize: dimensions.fontSize.caption }]}> 
          Progress
        </Text>
        <Text style={[styles.progressPercent, { fontSize: dimensions.fontSize.caption }]}> 
          {progress}%
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

// Section Card Component
const SectionCard = ({ stepId, title, isUnlocked, contentText, children, style }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ttsService = useRef(new TTSService()).current;

  const handleAudioPress = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      Speech.speak(contentText, {
        onStart: () => setIsPlaying(true),
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  return (
    <View style={[styles.sectionContent, style]}>
      <View style={styles.audioControls}>
        <TouchableOpacity
          style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
          onPress={handleAudioPress}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={dimensions.iconSize.medium}
            color={COLORS.primary}
          />
          <Text style={styles.audioButtonText}>
            {isPlaying ? "Pause" : "Listen"}
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

const BibleStudyContent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const sectionRefs = useRef([]);
  // Accept initial progress from route params
  const initialProgress = route?.params?.progress || 0;
  const onProgressUpdate = route?.params?.onProgressUpdate;
  const [progress, setProgress] = useState(initialProgress);

  // Get data from route params
  const bibleReading = route?.params?.bibleReading || {};
  const reading = bibleReading; // alias for easier use in component

  // Steps configuration
  const steps = [
    { id: 'verse', title: 'Main Verse', icon: 'book-outline' },
    { id: 'explanation', title: 'Explanation', icon: 'bulb-outline' },
    { id: 'related', title: 'Related Verses', icon: 'library-outline' },
    { id: 'knowledge', title: 'Did You Know?', icon: 'lightbulb-outline' },
    { id: 'activity', title: 'Activity', icon: 'checkmark-circle-outline' },
  ];

  // Save progress to AsyncStorage
  const saveProgress = async (progressValue) => {
    if (!reading || !reading.id) return;
    
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('bibleProgress', JSON.stringify({
        percent: progressValue,
        studyId: reading.id,
        lastUpdated: Date.now()
      }));
      await AsyncStorage.setItem('bibleProgressDate', today);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Function to safely update progress in parent component
  const safeProgressUpdate = useRef(null);
  
  // Setup the safe update function
  useEffect(() => {
    safeProgressUpdate.current = (percent) => {
      if (onProgressUpdate && typeof onProgressUpdate === 'function') {
        setTimeout(() => {
          onProgressUpdate(percent);
        }, 0);
      }
    };
  }, [onProgressUpdate]);
  
  // Load existing progress
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        if (!reading || !reading.id) return;
        const today = new Date().toDateString();
        const progressDate = await AsyncStorage.getItem('bibleProgressDate');
        if (progressDate === today) {
          const savedProgress = await AsyncStorage.getItem('bibleProgress');
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            if (progressData.studyId === reading.id && progressData.percent > initialProgress) {
              setProgress(progressData.percent);
              if (safeProgressUpdate.current) safeProgressUpdate.current(progressData.percent);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    };
    
    loadSavedProgress();
  }, [reading?.id, initialProgress]);

  // Handle scroll for progress tracking
  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // Each section is roughly screenHeight * 0.85 tall
    const sectionHeight = screenHeight * 0.85;
    // Calculate which section is most visible
    let sectionIndex = Math.round(yOffset / sectionHeight);
    // Clamp to valid range
    sectionIndex = Math.max(0, Math.min(sectionIndex, steps.length - 1));
    setCurrentStep(sectionIndex);
    // Calculate progress percentage
    const percent = Math.round(((sectionIndex + 1) / steps.length) * 100);
    // Only increase progress, never decrease
    setProgress(prev => {
      const newProgress = percent > prev ? percent : prev;
      
      // Save progress to AsyncStorage when it changes
      if (newProgress !== prev) {
        saveProgress(newProgress);
        
        // Use the safe update method with a timeout to avoid state updates during render
        if (safeProgressUpdate.current) {
          safeProgressUpdate.current(newProgress);
        }
      }
      
      return newProgress;
    });
  };

  // Handle step completion
  const handleStepComplete = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  // Step Indicator Component
  const StepIndicator = ({ step, index, isActive, isCompleted, isUnlocked }) => {
    return (
      <View style={styles.stepIndicatorContainer}>
        <View style={[
          styles.stepCircle,
          isCompleted ? styles.stepCompleted :
          isActive ? styles.stepActive :
          isUnlocked ? styles.stepUnlocked :
          styles.stepLocked
        ]}>
          {isCompleted ? (
            <Ionicons 
              name="checkmark" 
              size={dimensions.iconSize.small} 
              color={COLORS.background} 
            />
          ) : isUnlocked ? (
            <Ionicons 
              name={step.icon} 
              size={dimensions.iconSize.small} 
              color={isActive ? COLORS.primary : COLORS.text.tertiary} 
            />
          ) : (
            <Ionicons 
              name="lock-closed" 
              size={dimensions.iconSize.small} 
              color={COLORS.text.tertiary} 
            />
          )}
        </View>
        {index < steps.length - 1 && (
          <View style={[
            styles.stepConnector,
            completedSteps.has(step.id) ? styles.stepConnectorCompleted : null
          ]} />
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        
        {/* Video Background */}
        <VideoBackground />
        
        {/* Overlay for content readability */}
        <View style={styles.overlay} />
        
        {/* Celebration Modal */}
        <Modal visible={showCelebration} transparent>
          <View style={styles.celebrationOverlay}>
            <Animated.View style={[
              styles.celebrationContent,
              { opacity: celebrationAnim, transform: [{ scale: celebrationAnim }] }
            ]}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationTitle}>Congratulations!</Text>
              <Text style={styles.celebrationText}>You've completed all steps!</Text>
            </Animated.View>
          </View>
        </Modal>

        {/* Journal Modal */}
        <Modal visible={showJournal} transparent>
          <View style={styles.journalOverlay}>
            <View style={styles.journalModal}>
              <View style={styles.journalHeader}>
                <View>
                  <Text style={styles.journalTitle}>Personal Reflection</Text>
                  <Text style={styles.journalDate}>
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.journalCloseButton}
                  onPress={() => setShowJournal(false)}
                >
                  <Ionicons 
                    name="close" 
                    size={dimensions.iconSize.medium} 
                    color={COLORS.text.primary} 
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.journalContent}>
                <TextInput
                  style={styles.journalTextInput}
                  multiline
                  placeholder="Write your thoughts and reflections here..."
                  value={journalText}
                  onChangeText={setJournalText}
                  textAlignVertical="top"
                />
              </ScrollView>
              
              <View style={styles.journalFooter}>
                <TouchableOpacity 
                  style={[styles.journalButton, styles.journalCancelButton]}
                  onPress={() => setShowJournal(false)}
                >
                  <Text style={styles.journalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.journalButton, styles.journalSaveButton]}
                  onPress={() => {
                    // Save logic here
                    setShowJournal(false);
                  }}
                >
                  <Text style={styles.journalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Header */}
        <View style={styles.header}> 
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={dimensions.iconSize.small} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail"> 
              {reading?.title || 'Bible Study'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail"> 
              {reading?.category?.name || reading?.theme || 'Study'}
            </Text>
          </View>
          {/* Empty View to maintain layout balance */}
          <View style={styles.emptyRightSpace} />
        </View>
        
        {/* Progress Bar just under header */}
        <View style={{ marginTop: dimensions.headerHeight }}>
          <ProgressBar progress={progress} />
        </View>
        
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          snapToInterval={screenHeight * 0.85}
          decelerationRate="fast"
          snapToAlignment="center"
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {/* Main Verse Section */}
         <View
            ref={el => sectionRefs.current[0] = el}
            style={[styles.centeredSection, { backgroundColor: 'rgba(160,117,83,0.15)', padding: dimensions.spacing.md, width: '100%' }]}
          >
            <SectionCard 
              stepId="verse" 
              title="Main Verse"
              isUnlocked={true}
              contentText={`Main Verse: ${reading?.main_verse || 'Verse reference'}. ${reading?.verse_text || reading?.explanation || 'Verse text here'}`}
            >
              <View style={styles.verseCard}>
                <View style={styles.verseContent}>
                  <View style={styles.verseHeader}>
                    <Ionicons 
                      name="book-outline" 
                      size={dimensions.iconSize.medium} 
                      color={COLORS.background} 
                    />
                    <Text style={styles.verseSectionTitle}>Scripture</Text>
                  </View>
                  <View style={styles.verseDivider} />
                  <View style={styles.verseTextContainer}>
                    <Text style={styles.verseReference}> 
                      {reading?.main_verse || reading?.verse_reference?.[0] || 'Verse reference'}
                    </Text>
                    <Text style={styles.verseText}> 
                      "{reading?.verse_text || reading?.explanation || 'Verse text here'}"
                    </Text>
                  </View>
                </View>
              </View>
            </SectionCard>
          </View>

          {/* Explanation Section */}
          <View
            ref={el => sectionRefs.current[1] = el}
            style={[styles.centeredSection, { backgroundColor: 'rgba(122, 88, 54, 0.12)', padding: dimensions.spacing.xl }]}
          >
            <SectionCard 
              stepId="explanation" 
              title="Explanation"
              isUnlocked={true}
              contentText={`Explanation: ${reading?.explanation || 'Detailed explanation of the verse'}`}
              style={styles.explanationCard}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons 
                    name="bulb-outline" 
                    size={dimensions.iconSize.medium} 
                    color="#F5DEB3" 
                  />
                  <Text style={styles.cardTitle}> 
                    Explanation
                  </Text>
                </View>
                <View style={styles.cardDivider} />
                <Text style={styles.cardText}> 
                  {reading?.explanation || 'Detailed explanation of the verse will appear here.'}
                </Text>
              </View>
            </SectionCard>
          </View>

          {/* Related Verses Section */}
          <View
            ref={el => sectionRefs.current[2] = el}
            style={[styles.centeredSection, { backgroundColor: 'rgba(160, 117, 83, 0.2)', padding: dimensions.spacing.xl }]}
          >
            <SectionCard 
              stepId="related" 
              title="Related Verses"
              isUnlocked={true}
              contentText={`Related Verses: ${(reading?.related_verses && Array.isArray(reading.related_verses)) ? 
                reading.related_verses.map(verse => `${verse.reference}: ${verse.text}`).join('. ') : 
                'No related verses available'}`}
            >
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}> 
                  Related Verses
                </Text>
                <View style={styles.versesContainer}>
                  {(reading?.related_verses && Array.isArray(reading.related_verses)) ? 
                    (reading?.related_verses && Array.isArray(reading.related_verses) ? reading.related_verses : (reading?.verse_reference || [])).map((verse, index) => (
                      <View key={index} style={styles.relatedVerse}>
                        <Text style={[styles.relatedVerseReference, { fontSize: dimensions.fontSize.caption }]}> 
                          {verse.reference || verse}
                        </Text>
                        <Text style={[styles.relatedVerseText, { fontSize: dimensions.fontSize.body }]}> 
                          "{verse.text || ''}"
                        </Text>
                      </View>
                    )) : 
                    <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}> 
                      No related verses available
                    </Text>
                  }
                </View>
              </View>
            </SectionCard>
          </View>

          {/* Did You Know Section */}
          <View
            ref={el => sectionRefs.current[3] = el}
            style={[styles.centeredSection, { backgroundColor: 'rgba(106, 142, 35, 0.12)', padding: dimensions.spacing.xl }]}
          >
            <SectionCard 
              stepId="knowledge" 
              title="Did You Know?"
              isUnlocked={true}
              style={[styles.knowledgeCard, { backgroundColor: 'rgba(67, 87, 29, 0.81)', padding: dimensions.spacing.xl }]}
              contentText={`Did You Know? ${reading?.did_you_know || 'Interesting facts and historical context will appear here.'}`}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons 
                    name="bulb-outline" 
                    size={dimensions.iconSize.small} 
                    color={COLORS.primary} 
                  />
                  <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}> 
                    Did You Know?
                  </Text>
                </View>
                <Text style={[styles.knowledgeText, { fontSize: dimensions.fontSize.body }]}> 
                  {reading?.did_you_know || 'Interesting facts and historical context will appear here.'}
                </Text>
              </View>
            </SectionCard>
          </View>

          {/* Activity Section */}
          <View
            ref={el => sectionRefs.current[4] = el}
            style={[styles.centeredSection, { backgroundColor: 'rgba(139,69,19,0.10)', padding: dimensions.spacing.xl }]}
          >
            <SectionCard 
              stepId="activity" 
              title="Activity of the Day"
              isUnlocked={true}
              style={[styles.activityCard, { backgroundColor: 'rgba(139, 69, 19, 0.89)', padding: dimensions.spacing.xl }]}
              contentText={`Activity of the Day: ${reading?.activity || 'Practical activity or exercise will appear here.'}`}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons 
                    name="checkmark-circle-outline" 
                    size={dimensions.iconSize.small} 
                    color={COLORS.primary} 
                  />
                  <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}> 
                    Activity of the Day
                  </Text>
                </View>
                <Text style={[styles.activityText, { fontSize: dimensions.fontSize.body }]}> 
                  {reading?.activity || 'Practical activity or exercise will appear here.'}
                </Text>
                {/* Take a Note Button */}
                <TouchableOpacity
                  style={styles.takeNoteButton}
                  onPress={() => {
                    navigation.navigate('Journal', {
                      verse: reading?.main_verse || reading?.verse_reference?.[0] || '',
                      verseText: reading?.verse_text || reading?.explanation || '',
                      category: reading?.category || null,
                      fromBibleStudy: true,
                    });
                  }}
                >
                  <Text style={styles.takeNoteButtonText}>Take a Note</Text>
                </TouchableOpacity>
              </View>
            </SectionCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  takeNoteButton: {
    marginTop: dimensions.spacing.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  takeNoteButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: dimensions.fontSize.body,
    letterSpacing: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(101, 67, 33, 0.4)', // Brownish overlay
  },
  container: {
    flex: 1,
    backgroundColor: '#8B4513', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D2B48C', 
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: '#654321',
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.background, // White background to match other pages
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    zIndex: 2,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 35, // Adjusted for platform
    left: 0,
    right: 0,
    height: dimensions.headerHeight + 20, // Increased height by 20
    paddingLeft: dimensions.spacing.sm,
    paddingRight: dimensions.spacing.sm,
  },
  backButton: {
    padding: dimensions.spacing.sm,
    marginRight: dimensions.spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 20,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xs,
  },
  emptyRightSpace: {
    width: 36, // Same width as back button for balance
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    fontSize: Math.min(dimensions.fontSize.title * 0.9, 16), // Reduce font size and cap at 16
    textAlign: 'center',
    marginHorizontal: dimensions.spacing.md,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: COLORS.text.secondary,
    marginTop: 2, // Reduced spacing
    fontSize: Math.min(dimensions.fontSize.caption * 0.9, 12), // Smaller subtitle size, capped at 12
    textAlign: 'center',
  },
  journalButton: {
    padding: dimensions.spacing.xs,
    marginLeft: dimensions.spacing.xs,
  },
  progressContainer: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: 'rgba(139, 69, 19, 0.9)', 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 117, 83, 0.3)',
    zIndex: 2,
    position: 'absolute',
    top: dimensions.headerHeight + -30, 
    left: 0,
    right: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.sm,
  },
  progressLabel: {
    fontWeight: '500',
    color: '#F5DEB3',
  },
  progressPercent: {
    fontWeight: '500',
    color: '#F5DEB3',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(160, 117, 83, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#228B22', 
    borderRadius: 3,
  },
  centeredSection: {
    minHeight: screenHeight * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: dimensions.spacing.sm, // Add horizontal padding
    paddingBottom: dimensions.spacing.xl, // Add bottom padding
  },
  stepsContainer: {
    backgroundColor: 'rgba(160, 117, 83, 0.9)', 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(101, 67, 33, 0.3)',
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.md,
    zIndex: 2,
    position: 'absolute',
    top: dimensions.headerHeight + 60,
    left: 0,
    right: 0,
  },
  stepsContent: {
    paddingHorizontal: dimensions.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: dimensions.iconSize.medium * 1.5,
    height: dimensions.iconSize.medium * 1.5,
    borderRadius: dimensions.iconSize.medium * 0.75,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  stepActive: {
    borderColor: '#F5DEB3',
    backgroundColor: 'rgba(245, 222, 179, 0.2)',
  },
  stepUnlocked: {
    borderColor: 'rgba(245, 222, 179, 0.6)',
    backgroundColor: 'rgba(245, 222, 179, 0.1)',
  },
  stepLocked: {
    borderColor: 'rgba(245, 222, 179, 0.3)',
    backgroundColor: 'rgba(245, 222, 179, 0.05)',
  },
  stepConnector: {
    width: dimensions.spacing.lg,
    height: 2,
    backgroundColor: 'rgba(245, 222, 179, 0.3)',
    marginHorizontal: dimensions.spacing.sm,
  },
  stepConnectorCompleted: {
    backgroundColor: '#228B22',
  },
  content: {
    flex: 1,
    paddingTop: dimensions.headerHeight + 70, // Adjusted for the new header height
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 0, 
    marginTop: -50,
  },
  sectionCard: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.lg,
    marginBottom: 0,
    position: 'relative',
    marginTop: dimensions.spacing.xs, 
  },
  sectionVideoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -2,
  },
  sectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(101, 67, 33, 0.6)',
    zIndex: -1,
  },
 sectionContent: {
  borderRadius: 20,
  padding: dimensions.spacing.lg,
  width: '94%', // Wider cards that make better use of space
  maxWidth: screenWidth > 600 ? 600 : '94%', // Limit max width on larger screens
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
  marginHorizontal: 'auto',
},
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.md,
    backgroundColor: 'rgba(245, 222, 179, 0.9)',
    borderRadius: 25,
    marginTop: dimensions.spacing.lg,
    borderWidth: 1,
    borderColor: '#A0754B',
  },
  completeButtonText: {
    color: '#654321', 
    marginLeft: dimensions.spacing.sm,
    fontWeight: '600',
    fontSize: dimensions.fontSize.body,
  },
  // Verse card with brownish theme
  verseCard: {
    backgroundColor: 'rgba(101, 67, 33, 0.95)', 
    borderRadius: 20,
    padding: dimensions.spacing.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.8)',
    minHeight: 180, // Slightly reduced height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Slightly reduced shadow
    shadowRadius: 6,
    elevation: 8,
  },
  verseContent: {
    alignItems: 'center',
    width: '100%', // Ensure content takes full width
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dimensions.spacing.sm,
  },
  verseSectionTitle: {
    color: '#F5DEB3',
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    marginLeft: dimensions.spacing.sm,
    letterSpacing: 0.7,
  },
  verseDivider: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(245, 222, 179, 0.4)',
    marginVertical: dimensions.spacing.md,
  },
  verseTextContainer: {
    alignItems: 'center',
    width: '100%', // Full width for text container
    paddingHorizontal: dimensions.spacing.md,
  },
  verseReference: {
    color: '#F5DEB3',
    fontWeight: '700',
    marginBottom: dimensions.spacing.md,
    textAlign: 'center',
    fontSize: dimensions.fontSize.title,
    letterSpacing: 0.5,
  },
  verseText: {
    color: '#F5DEB3', 
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
    letterSpacing: 0.3, // Improved letter spacing for readability
    maxWidth: '95%', // Prevent text from touching edges
  },
  // Card content with brownish theme
  cardContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: dimensions.spacing.sm, // Add some horizontal padding
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(245, 222, 179, 0.4)',
    marginBottom: dimensions.spacing.lg,
    alignSelf: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#F5DEB3', // Wheat
    marginLeft: dimensions.spacing.sm,
    fontSize: dimensions.fontSize.title,
    textAlign: 'center',
    letterSpacing: 0.7, // Improved letter spacing
  },
  cardText: {
    color: '#F5DEB3', // Wheat
    lineHeight: 26,
    textAlign: 'justify', // Justified text for better reading
    fontSize: dimensions.fontSize.body,
    paddingHorizontal: dimensions.spacing.sm, // Add horizontal padding
  },
  // Reflection styles
  reflectionHeader: {
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
    width: '100%',
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.md,
    backgroundColor: 'rgba(245, 222, 179, 0.9)', // Light wheat
    borderRadius: 25,
    marginTop: dimensions.spacing.md,
    borderWidth: 1,
    borderColor: '#A0754B',
  },
  journalButtonText: {
    color: '#654321', // Dark brown
    marginLeft: dimensions.spacing.sm,
    fontWeight: '600',
    fontSize: dimensions.fontSize.body,
  },
  reflectionText: {
    color: '#F5DEB3', // Wheat
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
    lineHeight: 24,
  },
  // Explanation card - add specific background
  explanationCard: {
    backgroundColor: 'rgba(101,67,33,0.95)', // Rich brown background
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(210, 180, 140, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    paddingVertical: dimensions.spacing.lg,
    paddingHorizontal: dimensions.spacing.md,
  },
  // Knowledge card with darker brown
  knowledgeCard: {
    backgroundColor: 'rgba(107,142,35,0.18)', // Keep card background
    borderRadius: 20,
  },
  knowledgeText: {
    color: '#F5DEB3', // Wheat
    lineHeight: 26,
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
  },
  
  // Activity card with medium brown
  activityCard: {
    backgroundColor: 'rgba(139,69,19,0.18)', // Keep card background
    borderRadius: 20,
  },
  activityText: {
    color: '#F5DEB3', // Wheat
    lineHeight: 26,
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
  },
  
  // Related verses with brownish theme
  versesContainer: {
    marginTop: dimensions.spacing.lg,
    width: '100%',
    marginBottom: dimensions.spacing.md,
  },
  relatedVerse: {
    backgroundColor: 'rgba(160, 117, 83, 0.3)', 
    borderRadius: 12,
    padding: dimensions.spacing.md,
    marginBottom: dimensions.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F5DEB3', // Wheat
    width: '97%', // Wider to use more space
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  relatedVerseReference: {
    color: '#F5DEB3', // Wheat
    fontWeight: '600',
    marginBottom: dimensions.spacing.sm,
    textAlign: 'left', // Left-aligned for better reading
    fontSize: dimensions.fontSize.subtitle,
    letterSpacing: 0.3,
  },
  relatedVerseText: {
    color: '#F5DEB3', // Wheat
    fontStyle: 'italic',
    textAlign: 'justify', // Justified text for better reading
    fontSize: dimensions.fontSize.body,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  emptyText: {
    color: 'rgba(245, 222, 179, 0.7)', // Light wheat
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Completion card with green-brown theme
  completionCard: {
    backgroundColor: 'rgba(107, 142, 35, 0.9)', // Olive drab green
    borderRadius: 20,
    padding: dimensions.spacing.xl,
    alignItems: 'center',
    height: screenHeight - (dimensions.headerHeight + 180),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 222, 179, 0.5)',
  },
  completionTitle: {
    color: '#F5DEB3', // Wheat
    fontWeight: '700',
    marginTop: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.md,
    fontSize: dimensions.fontSize.title,
    textAlign: 'center',
  },
  completionText: {
    color: '#F5DEB3', // Wheat
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
    lineHeight: 24,
  },
  
  // Audio controls with brownish theme
  audioControls: {
    alignSelf: 'flex-end', // Position at top right
    marginBottom: dimensions.spacing.md,
    marginRight: dimensions.spacing.md,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 222, 179, 0.6)', // Subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  audioButtonActive: {
    backgroundColor: 'rgba(139, 93, 51, 0.7)', // Brown when active
  },
  audioButtonText: {
    color: '#F5DEB3', // Wheat
    marginLeft: dimensions.spacing.sm,
    fontSize: dimensions.fontSize.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  audioButtonTextDisabled: {
    color: 'rgba(245, 222, 179, 0.5)',
  },
  ttsErrorText: {
    color: 'rgba(245, 222, 179, 0.7)',
    fontSize: dimensions.fontSize.caption,
    marginTop: dimensions.spacing.sm,
    textAlign: 'center',
  },
  
  // Modal styles with brownish theme
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(101, 67, 33, 0.8)', // Dark brown overlay
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationContent: {
    backgroundColor: 'rgba(245, 222, 179, 0.95)', // Wheat background
    borderRadius: 20,
    padding: dimensions.spacing.xl,
    alignItems: 'center',
    shadowColor: '#654321',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#A0754B',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: dimensions.spacing.lg,
  },
  celebrationTitle: {
    fontSize: dimensions.fontSize.title,
    fontWeight: '700',
    color: '#654321', // Dark brown
    marginBottom: dimensions.spacing.md,
  },
  celebrationText: {
    color: '#8B4513', // Saddle brown
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
  },
  
  // Journal modal with brownish theme
  journalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(101, 67, 33, 0.8)', // Dark brown overlay
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.md,
  },
  journalModal: {
    backgroundColor: 'rgba(245, 222, 179, 0.98)', // Wheat background
    borderRadius: 20,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#A0754B',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: dimensions.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 117, 83, 0.3)',
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
  },
  journalTitle: {
    fontWeight: '700',
    color: '#654321', // Dark brown
    fontSize: dimensions.fontSize.subtitle,
  },
  journalDate: {
    color: '#8B4513', // Saddle brown
    marginTop: dimensions.spacing.xs,
  },
  journalCloseButton: {
    padding: dimensions.spacing.sm,
  },
  journalContent: {
    padding: dimensions.spacing.lg,
    flex: 1,
  },
  journalTextInput: {
    borderWidth: 1,
    borderColor: 'rgba(160, 117, 83, 0.4)',
    borderRadius: 12,
    padding: dimensions.spacing.md,
    fontSize: dimensions.fontSize.body,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#654321', // Dark brown text
  },
  journalFooter: {
    flexDirection: 'row',
    padding: dimensions.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 117, 83, 0.3)',
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
  },
  journalButton: {
    flex: 1,
    paddingVertical: dimensions.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  journalCancelButton: {
    backgroundColor: 'rgba(160, 117, 83, 0.2)',
    marginRight: dimensions.spacing.md,
    borderWidth: 1,
    borderColor: '#A0754B',
  },
  journalSaveButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
  },
  journalCancelText: {
    color: '#654321', 
    fontWeight: '600',
  },
  journalSaveText: {
    color: '#F5DEB3', 
    fontWeight: '600',
  },
});
export default BibleStudyContent;