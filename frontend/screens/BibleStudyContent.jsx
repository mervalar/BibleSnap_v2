import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';

// Icon components (you can replace these with react-native-vector-icons)
const ChevronLeft = ({ size = 24, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>‹</Text>
);

const Book = ({ size = 20, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>📖</Text>
);

const Heart = ({ size = 20, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>❤️</Text>
);

const Lightbulb = ({ size = 20, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>💡</Text>
);

const CheckCircle = ({ size = 20, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const Edit3 = ({ size = 16, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>✏️</Text>
);

const X = ({ size = 20, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>✕</Text>
);

const Lock = ({ size = 16, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>🔒</Text>
);

const Play = ({ size = 16, color = '#000' }) => (
  <Text style={{ fontSize: size, color }}>▶️</Text>
);

const { width } = Dimensions.get('window');

const BibleStudyPage = () => {
  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));
  const route = useRoute();
  const { stark, onProgressUpdate } = route.params || {};

  useEffect(() => {
    if (onProgressUpdate) {
      const percent = Math.round((completedSteps.size / steps.length) * 100);
      onProgressUpdate(percent);
    }
  }, [completedSteps]);

  // Define the study steps
  const steps = [
    { id: 'verse', title: 'Read Main Verse', icon: Book },
    { id: 'explanation', title: 'Study Explanation', icon: Lightbulb },
    { id: 'related', title: 'Related Verses', icon: Book },
    { id: 'knowledge', title: 'Did You Know?', icon: Lightbulb },
    { id: 'activity', title: 'Complete Activity', icon: CheckCircle },
    { id: 'reflection', title: 'Personal Reflection', icon: Heart }
  ];

  const studyData = {
    title: "Faith in Times of Trouble",
    category: "Topical",
    lesson: 3,
    totalLessons: 5,
    stark: {
      title: "God's Promises Never Fail",
      mainVerse: {
        reference: "Hebrews 11:1",
        text: "Now faith is confidence in what we hope for and assurance about what we do not see."
      },
      explanation: "Faith is not merely wishful thinking or blind optimism. It is a confident trust in God's character and promises, even when circumstances seem impossible. The writer of Hebrews describes faith as having two key components: confidence in our hopes and assurance about unseen realities. This means that biblical faith is both forward-looking (hoping in God's promises) and present-focused (trusting in spiritual truths we cannot physically see).",
      relatedVerses: [
        {
          reference: "Romans 10:17",
          text: "So faith comes from hearing, and hearing through the word of Christ."
        },
        {
          reference: "2 Corinthians 5:7",
          text: "For we walk by faith, not by sight."
        },
        {
          reference: "James 1:3",
          text: "Because you know that the testing of your faith produces perseverance."
        }
      ],
      didYouKnow: "The Greek word for 'faith' (pistis) was commonly used in ancient times to describe the trust placed in a business contract or legal agreement. When the Bible speaks of faith, it's referring to the same kind of reliable, covenant-based trust we place in God.",
      activity: "Write down three current challenges in your life. Next to each challenge, write one of God's promises from Scripture that speaks to that situation. Spend time praying over each promise, asking God to strengthen your faith."
    }
  };

  const progress = (completedSteps.size / steps.length) * 100;

  const handleStepComplete = (stepId) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    
    // Move to next step
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
    
    // Show celebration if all steps completed
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
    const Icon = step.icon;

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
            <CheckCircle size={20} color="white" />
          ) : isUnlocked ? (
            <Icon size={20} color={isActive ? '#9E795D' : '#999'} />
          ) : (
            <Lock size={16} color="#ccc" />
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

  const SectionCard = ({ children, stepId, title, isUnlocked, style = {} }) => {
    const isCompleted = isStepCompleted(stepId);
    
    return (
      <View style={[
        styles.sectionCard,
        !isUnlocked && styles.sectionCardLocked,
        isCompleted && styles.sectionCardCompleted,
        style
      ]}>
        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Lock size={32} color="#ccc" />
            <Text style={styles.lockedText}>Complete previous steps to unlock</Text>
          </View>
        )}
        
        {isCompleted && (
          <View style={styles.completedBadge}>
            <CheckCircle size={16} color="white" />
          </View>
        )}
        
        {children}
        
        {isUnlocked && !isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleStepComplete(stepId)}
          >
            <Play size={16} color="white" />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <ChevronLeft size={24} color="#9E795D" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{stark.title}</Text>
            <Text style={styles.headerSubtitle}>
              Lesson {studyData.lesson} of {studyData.totalLessons} • {studyData.category}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Step Indicators */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsContainer}>
          <View style={styles.stepsContent}>
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
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Stark Title */}
        <View style={styles.starkTitleCard}>
          <View style={styles.starkTitleHeader}>
            <View style={styles.starkTitleIcon}>
              <Book size={20} color="#9E795D" />
            </View>
            <View>
              <Text style={styles.starkTitle}>{stark.title}</Text>
              <Text style={styles.starkSubtitle}>Today's Stark</Text>
            </View>
          </View>
        </View>

        {/* Main Verse */}
        <SectionCard stepId="verse" isUnlocked={isStepUnlocked(0)}>
          <View style={styles.verseCard}>
            <View style={styles.verseContent}>
              <Book size={24} color="#EEDED2" />
              <View style={styles.verseTextContainer}>
                <Text style={styles.verseReference}>{stark.main_verse}</Text>
                <Text style={styles.verseText}>"{stark.explanation}"</Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* Explanation */}
        <SectionCard stepId="explanation" isUnlocked={isStepUnlocked(1)}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Lightbulb size={20} color="#9E795D" />
              <Text style={styles.cardTitle}>Explanation</Text>
            </View>
            <Text style={styles.cardText}>{stark.explanation}</Text>
          </View>
        </SectionCard>

        {/* Related Verses */}
        <SectionCard stepId="related" isUnlocked={isStepUnlocked(2)}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Related Verses</Text>
            <View style={styles.versesContainer}>
              {studyData.stark.relatedVerses.map((verse, index) => (
                <View key={index} style={styles.relatedVerse}>
                  <Text style={styles.relatedVerseReference}>{verse.reference}</Text>
                  <Text style={styles.relatedVerseText}>"{verse.text}"</Text>
                </View>
              ))}
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
              <Lightbulb size={20} color="#9E795D" />
              <Text style={[styles.cardTitle, styles.knowledgeTitle]}>Did You Know?</Text>
            </View>
            <Text style={styles.knowledgeText}>{stark.did_you_know}</Text>
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
              <CheckCircle size={20} color="green" />
              <Text style={[styles.cardTitle, styles.activityTitle]}>Activity of the Day</Text>
            </View>
            <Text style={styles.activityText}>{stark.activity}</Text>
          </View>
        </SectionCard>

        {/* Personal Reflection */}
        <SectionCard stepId="reflection" isUnlocked={isStepUnlocked(5)}>
          <View style={styles.cardContent}>
            <View style={styles.reflectionHeader}>
              <View style={styles.cardHeader}>
                <Heart size={20} color="#9E795D" />
                <Text style={styles.cardTitle}>Personal Reflection</Text>
              </View>
              {isStepUnlocked(5) && (
                <TouchableOpacity 
                  style={styles.journalButton}
                  onPress={() => setShowJournal(true)}
                >
                  <Edit3 size={16} color="#9E795D" />
                  <Text style={styles.journalButtonText}>Journal</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.reflectionText}>
              Click the Journal button to record your personal reflections and thoughts about today's lesson.
            </Text>
          </View>
        </SectionCard>

        {/* Completion Status */}
        {completedSteps.size === steps.length && (
          <View style={styles.completionCard}>
            <CheckCircle size={32} color="white" />
            <Text style={styles.completionTitle}>Lesson Completed! 🎉</Text>
            <Text style={styles.completionText}>You've successfully completed all steps of this lesson.</Text>
          </View>
        )}
      </ScrollView>

      {/* Journal Modal */}
      <Modal visible={showJournal} animationType="slide" transparent>
        <View style={styles.journalOverlay}>
          <View style={styles.journalModal}>
            <View style={styles.journalHeader}>
              <View>
                <Text style={styles.journalTitle}>Personal Journal</Text>
                <Text style={styles.journalDate}>
                  {new Date().toLocaleDateString()} • {studyData.stark.title}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowJournal(false)}
                style={styles.journalCloseButton}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.journalContent}>
              <TextInput
                value={journalText}
                onChangeText={setJournalText}
                placeholder="Write your thoughts, prayers, and reflections about today's lesson..."
                multiline
                style={styles.journalTextInput}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.journalFooter}>
              <TouchableOpacity 
                onPress={() => setShowJournal(false)}
                style={[styles.journalButton, styles.journalCancelButton]}
              >
                <Text style={styles.journalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveJournal}
                style={[styles.journalButton, styles.journalSaveButton]}
              >
                <Text style={styles.journalSaveText}>Save & Complete</Text>
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
    backgroundColor: '#EEDED2',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9E795D',
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E795D',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9E795D',
    borderRadius: 6,
  },
  stepsContainer: {
    marginTop: 24,
  },
  stepsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: 'green',
    borderColor: '#4CAF50',
  },
  stepActive: {
    borderColor: '#9E795D',
    backgroundColor: '#EEDED2',
  },
  stepUnlocked: {
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  stepLocked: {
    borderColor: '#f0f0f0',
    backgroundColor: '#f8f8f8',
  },
  stepConnector: {
    width: 64,
    height: 4,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  stepConnectorCompleted: {
    backgroundColor: 'green',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  starkTitleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starkTitleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starkTitleIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEDED2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  starkTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  starkSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  sectionCardLocked: {
    opacity: 0.5,
  },
  sectionCardCompleted: {
    borderWidth: 2,
    borderColor: 'green',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 248, 248, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  lockedText: {
    color: '#666',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    backgroundColor: 'green',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  completeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#9E795D',
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  verseCard: {
    backgroundColor: '#9E795D',
    borderRadius: 12,
    padding: 24,
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  verseReference: {
    color: '#EEDED2',
    fontWeight: '600',
    marginBottom: 8,
  },
  verseText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardText: {
    color: '#555',
    lineHeight: 24,
    fontSize: 16,
  },
  versesContainer: {
    marginTop: 8,
  },
  relatedVerse: {
    borderLeftWidth: 4,
    borderLeftColor: '#EEDED2',
    paddingLeft: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  relatedVerseReference: {
    color: '#9E795D',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  relatedVerseText: {
    color: '#555',
    fontStyle: 'italic',
    fontSize: 16,
  },
  knowledgeCard: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#e8eeff',
  },
  knowledgeTitle: {
    color: '#333',
  },
  knowledgeText: {
    color: '#555',
    lineHeight: 24,
    fontSize: 16,
  },
  activityCard: {
    backgroundColor: '#f8fff8',
    borderWidth: 1,
    borderColor: '#e8ffe8',
  },
  activityTitle: {
    color: '#333',
  },
  activityText: {
    color: '#555',
    lineHeight: 24,
    fontSize: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEDED2',
    borderRadius: 8,
  },
  journalButtonText: {
    color: '#9E795D',
    marginLeft: 8,
    fontWeight: '500',
  },
  reflectionText: {
    color: '#666',
    fontSize: 14,
  },
  completionCard: {
    backgroundColor: 'green',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  completionText: {
    color: '#e8ffe8',
    textAlign: 'center',
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 8,
  },
  celebrationText: {
    color: '#666',
    textAlign: 'center',
  },
  journalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  journalModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  journalDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  journalCloseButton: {
    padding: 8,
  },
  journalContent: {
    padding: 24,
    flex: 1,
  },
  journalTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    height: 200,
    fontSize: 16,
  },
  journalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  journalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  journalCancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  journalSaveButton: {
    backgroundColor: '#9E795D',
  },
  journalCancelText: {
    color: '#666',
    fontWeight: '500',
  },
  journalSaveText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default BibleStudyPage;