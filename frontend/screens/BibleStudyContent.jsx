import React, { useState, useEffect ,useRef } from 'react';
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
// Responsive dimensions (matching Journal app)
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 80 : 60,
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

// Professional color palette (matching Journal app)
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

const BibleStudyContent = () => {
  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { stark, onProgressUpdate } = route.params || {};
  const dimensions = getResponsiveDimensions();
  const navigation = useNavigation();
const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingStep, setCurrentPlayingStep] = useState(null);
  const soundRef = useRef(null);

  // Function to play audio for a specific step
  const playStepAudio = async (stepId, textToRead) => {
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }

      // On iOS/Android, use TTS
      if (Platform.OS !== 'web') {
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          { uri: 'https://your-tts-service.com/generate?text=${encodeURIComponent(textToRead)}' }, // Replace with actual TTS implementation
          { shouldPlay: true }
        );
        soundRef.current = playbackObject;
        setCurrentPlayingStep(stepId);
        setIsPlaying(true);
        
        playbackObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentPlayingStep(null);
          }
        });
      } else {
        // On web, use the Web Speech API
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentPlayingStep(null);
        };
        speechSynthesis.speak(utterance);
        setCurrentPlayingStep(stepId);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (Platform.OS !== 'web') {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
        }
      } else {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setCurrentPlayingStep(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (Platform.OS === 'web') {
        speechSynthesis.cancel();
      }
    };
  }, []);
  useEffect(() => {
    if (onProgressUpdate) {
      const percent = Math.round((completedSteps.size / steps.length) * 100);
      onProgressUpdate(percent);
    }
  }, [completedSteps]);

  // Define the study steps
  const steps = [
    { id: 'verse', title: 'Read Main Verse', icon: 'book-outline' },
    { id: 'explanation', title: 'Study Explanation', icon: 'bulb-outline' },
    { id: 'related', title: 'Related Verses', icon: 'book-outline' },
    { id: 'knowledge', title: 'Did You Know?', icon: 'bulb-outline' },
    { id: 'activity', title: 'Complete Activity', icon: 'checkmark-circle-outline' },
    { id: 'reflection', title: 'Personal Reflection', icon: 'heart-outline' }
  ];

  const progress = (completedSteps.size / steps.length) * 100;

  const saveProgress = async (completedSteps, currentStep) => {
    try {
      const today = new Date().toDateString();
      const progress = {
        date: today,
        percent: Math.round((completedSteps.size / steps.length) * 100),
        currentStep,
        completedSteps: Array.from(completedSteps)
      };
      
      await AsyncStorage.setItem('challengeProgress', JSON.stringify(progress));
      await AsyncStorage.setItem('challengeProgressDate', today);
      
      if (onProgressUpdate) {
        onProgressUpdate(progress.percent);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleStepComplete = (stepId) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
    
    saveProgress(newCompleted, stepIndex + 1);
    
    if (newCompleted.size === steps.length) {
      setShowCelebration(true);
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 500,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCelebration(false));
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const today = new Date().toDateString();
        const progress = await AsyncStorage.getItem('challengeProgress');
        const progressDate = await AsyncStorage.getItem('challengeProgressDate');
        
        if (progress && progressDate === today) {
          const progressData = JSON.parse(progress);
          setCompletedSteps(new Set(progressData.completedSteps));
          setCurrentStep(progressData.currentStep);
          
          if (onProgressUpdate) {
            onProgressUpdate(progressData.percent);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, []);

  const isStepUnlocked = (stepIndex) => {
    if (stepIndex === 0) return true;
    return completedSteps.has(steps[stepIndex - 1].id);
  };

  const isStepCompleted = (stepId) => completedSteps.has(stepId);

  const handleSaveJournal = () => {
    if (journalText.trim()) {
      handleStepComplete('reflection');
    }
    setShowJournal(false);
  };

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

    const SectionCard = ({ children, stepId, title, isUnlocked, style = {}, contentText }) => {
    const isCompleted = isStepCompleted(stepId);
    const isCurrentlyPlaying = currentPlayingStep === stepId && isPlaying;

    return (
      <View style={[
        styles.sectionCard,
        !isUnlocked && styles.sectionCardLocked,
        isCompleted && styles.sectionCardCompleted,
        style
      ]}>
       {isUnlocked && contentText && (
          <View style={styles.audioControls}>
            <TouchableOpacity
              onPress={() => isCurrentlyPlaying ? stopAudio() : playStepAudio(stepId, contentText)}
              style={styles.audioButton}
            >
              <Ionicons 
                name={isCurrentlyPlaying ? 'pause' : 'play'} 
                size={dimensions.iconSize.small} 
                color={COLORS.primary} 
              />
              <Text style={styles.audioButtonText}>
                {isCurrentlyPlaying ? 'Pause Audio' : 'Listen to this Step'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {children}
        
        
        {isUnlocked && !isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleStepComplete(stepId)}
          >
            <Ionicons 
              name="play" 
              size={dimensions.iconSize.small} 
              color={COLORS.background} 
            />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading study content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
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

      {/* Header */}
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={dimensions.iconSize.medium} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
            {stark?.title || 'Bible Study'}
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: dimensions.fontSize.caption }]}>
            {stark?.category?.name || 'Study'}
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: dimensions.fontSize.caption }]}>
            Progress
          </Text>
          <Text style={[styles.progressPercent, { fontSize: dimensions.fontSize.caption }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Step Indicators */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.stepsContainer}
        contentContainerStyle={styles.stepsContent}
      >
        {steps.map((step, index) => (
          <StepIndicator
            key={step.id}
            step={step}
            index={index}
            isActive={currentStep === index}
            isCompleted={isStepCompleted(step.id)}
            isUnlocked={isStepUnlocked(index)}
          />
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Verse */}
          <SectionCard 
              stepId="verse" 
              isUnlocked={isStepUnlocked(0)}
              contentText={`Main Verse: ${stark?.main_verse || 'Verse reference'}. ${stark?.explanation || 'Verse text here'}`}
            >
          <View style={styles.verseCard}>
            <View style={styles.verseContent}>
              <Ionicons 
                name="book-outline" 
                size={dimensions.iconSize.medium} 
                color={COLORS.background} 
              />
              <View style={styles.verseTextContainer}>
                <Text style={[styles.verseReference, { fontSize: dimensions.fontSize.subtitle }]}>
                  {stark?.main_verse || 'Verse reference'}
                </Text>
                <Text style={[styles.verseText, { fontSize: dimensions.fontSize.body }]}>
                  "{stark?.explanation || 'Verse text here'}"
                </Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* Explanation */}
          <SectionCard 
          stepId="explanation" 
          isUnlocked={isStepUnlocked(1)}
          contentText={`Explanation: ${stark?.explanation || 'Detailed explanation of the verse'}`}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons 
                name="bulb-outline" 
                size={dimensions.iconSize.small} 
                color={COLORS.primary} 
              />
              <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Explanation
              </Text>
            </View>
            <Text style={[styles.cardText, { fontSize: dimensions.fontSize.body }]}>
              {stark?.explanation || 'Detailed explanation of the verse will appear here.'}
            </Text>
          </View>
        </SectionCard>

        {/* Related Verses */}
        <SectionCard stepId="related" isUnlocked={isStepUnlocked(2)}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Related Verses
            </Text>
            <View style={styles.versesContainer}>
              {(stark?.related_verses && Array.isArray(stark.related_verses)) ? 
                stark.related_verses.map((verse, index) => (
                  <View key={index} style={styles.relatedVerse}>
                    <Text style={[styles.relatedVerseReference, { fontSize: dimensions.fontSize.caption }]}>
                      {verse.reference}
                    </Text>
                    <Text style={[styles.relatedVerseText, { fontSize: dimensions.fontSize.body }]}>
                      "{verse.text}"
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

        {/* Did You Know */}
        <SectionCard 
          stepId="knowledge" 
          isUnlocked={isStepUnlocked(3)} 
          style={styles.knowledgeCard}
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
              {stark?.did_you_know || 'Interesting facts and historical context will appear here.'}
            </Text>
          </View>
        </SectionCard>

        {/* Activity */}
        <SectionCard 
          stepId="activity" 
          isUnlocked={isStepUnlocked(4)} 
          style={styles.activityCard}
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
              {stark?.activity || 'Practical activity or exercise will appear here.'}
            </Text>
          </View>
        </SectionCard>

        {/* Personal Reflection */}
        <SectionCard stepId="reflection" isUnlocked={isStepUnlocked(5)}>
          <View style={styles.cardContent}>
            <View style={styles.reflectionHeader}>
              <View style={styles.cardHeader}>
                <Ionicons 
                  name="heart-outline" 
                  size={dimensions.iconSize.small} 
                  color={COLORS.primary} 
                />
                <Text style={[styles.cardTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                  Personal Reflection
                </Text>
              </View>
              {isStepUnlocked(5) && (
                <TouchableOpacity 
                  style={styles.journalButton}
                  onPress={() => setShowJournal(true)}
                >
                  <Ionicons 
                    name="create-outline" 
                    size={dimensions.iconSize.small} 
                    color={COLORS.primary} 
                  />
                  <Text style={[styles.journalButtonText, { fontSize: dimensions.fontSize.caption }]}>
                    Journal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.reflectionText, { fontSize: dimensions.fontSize.body }]}>
              Click the Journal button to record your personal reflections and thoughts about today's lesson.
            </Text>
          </View>
        </SectionCard>

        {/* Completion Status */}
        {completedSteps.size === steps.length && (
          <View style={styles.completionCard}>
            <Ionicons 
              name="checkmark-circle" 
              size={dimensions.iconSize.large} 
              color={COLORS.background} 
            />
            <Text style={[styles.completionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Lesson Completed! 🎉
            </Text>
            <Text style={[styles.completionText, { fontSize: dimensions.fontSize.body }]}>
              You've successfully completed all steps of this lesson.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Journal Modal */}
      <Modal visible={showJournal} animationType="slide" transparent>
        <View style={styles.journalOverlay}>
          <View style={styles.journalModal}>
            <View style={styles.journalHeader}>
              <View>
                <Text style={[styles.journalTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                  Personal Journal
                </Text>
                <Text style={[styles.journalDate, { fontSize: dimensions.fontSize.caption }]}>
                  {new Date().toLocaleDateString()} • {stark?.title}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowJournal(false)}
                style={styles.journalCloseButton}
              >
                <Ionicons 
                  name="close" 
                  size={dimensions.iconSize.medium} 
                  color={COLORS.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.journalContent}>
              <TextInput
                value={journalText}
                onChangeText={setJournalText}
                placeholder="Write your thoughts, prayers, and reflections about today's lesson..."
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                style={[
                  styles.journalTextInput, 
                  { 
                    fontSize: dimensions.fontSize.body,
                    height: screenHeight * 0.4 
                  }
                ]}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.journalFooter}>
              <TouchableOpacity 
                onPress={() => setShowJournal(false)}
                style={[styles.journalButton, styles.journalCancelButton]}
              >
                <Text style={[styles.journalCancelText, { fontSize: dimensions.fontSize.body }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveJournal}
                style={[styles.journalButton, styles.journalSaveButton]}
              >
                <Text style={[styles.journalSaveText, { fontSize: dimensions.fontSize.body }]}>
                  Save & Complete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: dimensions.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    color: COLORS.primary,
    marginTop: dimensions.spacing.xs,
  },
  headerSpacer: {
    width: dimensions.iconSize.medium + dimensions.spacing.sm * 2,
  },
  progressContainer: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.sm,
  },
  progressLabel: {
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  progressPercent: {
    fontWeight: '500',
    color: COLORS.primary,
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
stepsContainer: {
  backgroundColor: COLORS.surfaceElevated,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.border.light,
  paddingVertical: dimensions.spacing.md,
  paddingHorizontal: dimensions.spacing.md,
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
    backgroundColor: COLORS.semantic.success,
    borderColor: COLORS.semantic.success,
  },
  stepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.overlay,
  },
  stepUnlocked: {
    borderColor: COLORS.border.medium,
    backgroundColor: COLORS.surface,
  },
  stepLocked: {
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  stepConnector: {
    width: dimensions.spacing.lg,
    height: 2,
    backgroundColor: COLORS.border.light,
    marginHorizontal: dimensions.spacing.sm,
  },
  stepConnectorCompleted: {
    backgroundColor: COLORS.semantic.success,
  },
 content: {
  flex: 1,
  backgroundColor: COLORS.surface,
  marginTop: 0
},
  contentContainer: {
  paddingTop: dimensions.spacing.sm, 
  paddingBottom: dimensions.spacing.md,
  paddingHorizontal: dimensions.spacing.md,
},

  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    marginBottom: dimensions.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    position: 'relative',
  },
  sectionCardLocked: {
    opacity: 0.7,
  },
  sectionCardCompleted: {
    borderWidth: 1,
    borderColor: COLORS.semantic.success,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  lockedText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginTop: dimensions.spacing.sm,
    textAlign: 'center',
    fontSize: dimensions.fontSize.caption,
  },
  completedBadge: {
    position: 'absolute',
    top: dimensions.spacing.md,
    right: dimensions.spacing.md,
    width: dimensions.iconSize.medium,
    height: dimensions.iconSize.medium,
    backgroundColor: COLORS.semantic.success,
    borderRadius: dimensions.iconSize.medium / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: dimensions.spacing.sm,
  },
  completeButtonText: {
    color: COLORS.background,
    marginLeft: dimensions.spacing.sm,
    fontWeight: '500',
    fontSize: dimensions.fontSize.caption,
  },
  verseCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: dimensions.spacing.lg,
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseTextContainer: {
    flex: 1,
    marginLeft: dimensions.spacing.md,
  },
  verseReference: {
    color: COLORS.background,
    fontWeight: '600',
    marginBottom: dimensions.spacing.sm,
  },
  verseText: {
    color: COLORS.background,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  cardContent: {
    padding: dimensions.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  cardTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: dimensions.spacing.sm,
  },
  cardText: {
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.overlay,
    borderRadius: 8,
  },
  journalButtonText: {
    color: COLORS.primary,
    marginLeft: dimensions.spacing.sm,
    fontWeight: '500',
  },
  reflectionText: {
    color: COLORS.text.secondary,
  },
  knowledgeCard: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#e8eeff',
  },
  knowledgeText: {
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  activityCard: {
    backgroundColor: '#f8fff8',
    borderWidth: 1,
    borderColor: '#e8ffe8',
  },
  activityText: {
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  versesContainer: {
    marginTop: dimensions.spacing.sm,
  },
  relatedVerse: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.overlay,
    paddingLeft: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.md,
  },
  relatedVerseReference: {
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: dimensions.spacing.xs,
  },
  relatedVerseText: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  emptyText: {
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  completionCard: {
    backgroundColor: COLORS.semantic.success,
    borderRadius: 12,
    padding: dimensions.spacing.lg,
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  completionTitle: {
    color: COLORS.background,
    fontWeight: 'bold',
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
  },
  completionText: {
    color: COLORS.background,
    textAlign: 'center',
    opacity: 0.9,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationContent: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: dimensions.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: dimensions.spacing.md,
  },
  celebrationTitle: {
    fontSize: dimensions.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.semantic.success,
    marginBottom: dimensions.spacing.sm,
  },
  celebrationText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: dimensions.fontSize.body,
  },
  journalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.md,
  },
  journalModal: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    maxHeight: '80%',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: dimensions.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  journalTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  journalDate: {
    color: COLORS.text.secondary,
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
    borderColor: COLORS.border.light,
    borderRadius: 8,
    padding: dimensions.spacing.md,
    fontSize: dimensions.fontSize.body,
  },
  journalFooter: {
    flexDirection: 'row',
    padding: dimensions.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  journalButton: {
    flex: 1,
    paddingVertical: dimensions.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  journalCancelButton: {
    backgroundColor: COLORS.surface,
    marginRight: dimensions.spacing.md,
  },
  journalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  journalCancelText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  journalSaveText: {
    color: COLORS.background,
    fontWeight: '500',
  },
   
  audioControls: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingBottom: dimensions.spacing.md,
    marginBottom: dimensions.spacing.md,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.sm,
    backgroundColor: COLORS.overlay,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    color: COLORS.primary,
    marginLeft: dimensions.spacing.sm,
    fontSize: dimensions.fontSize.caption,
  },
});

export default BibleStudyContent;