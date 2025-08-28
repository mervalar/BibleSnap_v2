import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import SplashScreen from '../components/SplashScreen';
import { Video } from 'expo-av';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BookContent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params;
  const [videoRef, setVideoRef] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapters, setChapters] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [highlights, setHighlights] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showToolbox, setShowToolbox] = useState(false);
  const highlightColors = ['#FFD700', '#90EE90', '#ADD8E6', '#FFB6C1'];
  
  // Audio progress state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // TTS state management
  const [chapterText, setChapterText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = 'de4e12af7f28f599-01';

  // Refs for tracking
  const progressInterval = useRef(null);
  const startTime = useRef(null);

  // Initialize TTS and fetch data
  useEffect(() => {
    initializeTTS();
    fetchChapters();
    loadHighlights(); 
    
    return () => {
      cleanupTTS();
      saveHighlights(); 
    };
  }, []);

  useEffect(() => {
    if (chapters.length > 0) {
      fetchChapterContent(currentChapter);
    }
  }, [currentChapter, chapters]);

  useEffect(() => {
    saveHighlights();
  }, [highlights]);

  const initializeTTS = async () => {
    try {
      // Get available voices
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
      const englishVoice = voices.find(voice => 
        voice.language.startsWith('en') || voice.language.includes('en')
      );
      setSelectedVoice(englishVoice || voices[0]);
    } catch (error) {
      console.log('TTS initialization error:', error);
    }
  };

  const saveHighlights = async () => {
    try {
      await AsyncStorage.setItem(`highlights_${book.id}`, JSON.stringify(highlights));
    } catch (e) {
      console.error('Failed to save highlights', e);
    }
  };

  const loadHighlights = async () => {
    try {
      const saved = await AsyncStorage.getItem(`highlights_${book.id}`);
      if (saved) {
        setHighlights(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load highlights', e);
    }
  };

  const cleanupTTS = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentVerseIndex(0);
      setCurrentTime(0);
      setProgress(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } catch (error) {
      console.log('TTS cleanup error:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`,
        { headers: { 'api-key': API_KEY } }
      );
      const data = await response.json();
      setChapters(data.data || []);
      if (data.data && data.data.length > 0) {
        setCurrentChapter(1);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Alert.alert('Error', 'Failed to load chapters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterContent = async (chapterNum) => {
    try {
      setLoading(true);
      
      // Stop current TTS
      await cleanupTTS();

      const chapter = chapters.find(c => c.number === chapterNum.toString());
      if (!chapter) return;

      // Fetch verses for the chapter
      const versesResponse = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapter.id}/verses`,
        { headers: { 'api-key': API_KEY } }
      );
      const versesData = await versesResponse.json();
      const chapterVerses = versesData.data || [];

      // Fetch text for each verse
      const versesWithText = await Promise.all(
        chapterVerses.map(async (verse) => {
          try {
            const verseDetailResponse = await fetch(
              `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/verses/${verse.id}`,
              { headers: { 'api-key': API_KEY } }
            );
            const verseDetailData = await verseDetailResponse.json();
            return {
              ...verse,
              text: verseDetailData.data?.content || '',
            };
          } catch (err) {
            return {
              ...verse,
              text: '',
            };
          }
        })
      );

      setVerses(versesWithText);
      
      // Prepare text for TTS
      const fullChapterText = versesWithText
        .map(verse => `Verse ${verse.number}. ${stripHtml(verse.text)}`)
        .join(' ');
      setChapterText(fullChapterText);
      
      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = fullChapterText.split(' ').length;
      const estimatedDuration = (wordCount / 150) * 60; // in seconds
      setDuration(estimatedDuration);
      
    } catch (error) {
      console.error(`Error fetching chapter ${chapterNum}:`, error);
      Alert.alert('Error', `Failed to load chapter ${chapterNum}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const startProgressTracking = () => {
    startTime.current = Date.now();
    setCurrentTime(0);
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      if (startTime.current && duration > 0) {
        const elapsed = (Date.now() - startTime.current) / 1000;
        const currentProgress = Math.min(elapsed / duration, 1);
        setCurrentTime(elapsed);
        setProgress(currentProgress);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const startTTS = async () => {
    try {
      if (!chapterText) {
        Alert.alert('No Content', 'No text available to read.');
        return;
      }

      setIsPlaying(true);
      setIsPaused(false);
      startProgressTracking();

      const options = {
        voice: selectedVoice?.identifier,
        rate: speechRate,
        pitch: speechPitch,
        onStart: () => {
          setIsPlaying(true);
        },
        onDone: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentVerseIndex(0);
          stopProgressTracking();
          setProgress(1);
          
          // Auto-advance to next chapter when finished
          if (currentChapter < chapters.length) {
            setTimeout(() => {
              goToNextChapter();
            }, 1000);
          }
        },
        onStopped: () => {
          setIsPlaying(false);
          setIsPaused(false);
          stopProgressTracking();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          setIsPlaying(false);
          setIsPaused(false);
          stopProgressTracking();
          Alert.alert('Speech Error', 'Unable to play text-to-speech. Please try again.');
        }
      };

      await Speech.speak(chapterText, options);
    } catch (error) {
      console.error('TTS start error:', error);
      Alert.alert('Speech Error', 'Could not start text-to-speech. Please try again.');
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const pauseTTS = async () => {
    try {
      await Speech.pause();
      setIsPaused(true);
      setIsPlaying(false);
      stopProgressTracking();
    } catch (error) {
      console.error('TTS pause error:', error);
    }
  };

  const resumeTTS = async () => {
    try {
      await Speech.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTracking();
    } catch (error) {
      console.error('TTS resume error:', error);
    }
  };

  const stopTTS = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentVerseIndex(0);
      stopProgressTracking();
      setCurrentTime(0);
      setProgress(0);
    } catch (error) {
      console.error('TTS stop error:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await pauseTTS();
      } else if (isPaused) {
        await resumeTTS();
      } else {
        await startTTS();
      }
    } catch (error) {
      console.error('TTS toggle error:', error);
      Alert.alert('Speech Error', 'Could not control text-to-speech. Please try again.');
    }
  };

  const goToNextChapter = async () => {
    if (currentChapter < chapters.length) {
      await cleanupTTS();
      setCurrentChapter(currentChapter + 1);
    }
  };

  const goToPrevChapter = async () => {
    if (currentChapter > 1) {
      await cleanupTTS();
      setCurrentChapter(currentChapter - 1);
    }
  };

  const adjustSpeechRate = (rate) => {
    setSpeechRate(rate);
    if (isPlaying) {
      // Restart with new rate
      stopTTS().then(() => {
        setTimeout(() => startTTS(), 500);
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && verses.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }

  const handleVersePress = (verse) => {
    setSelectedVerse(verse);
    setShowToolbox(true);
  };

  const handleHighlight = async (color) => {
    if (!selectedVerse) return;
    // Stop TTS when highlighting
    await stopTTS();
    setHighlights(prev => ({
      ...prev,
      [selectedVerse.id]: {
        color,
        text: stripHtml(selectedVerse.text)
      }
    }));
    setShowToolbox(false);
  };

  const removeHighlight = (verseId) => {
    setHighlights(prev => {
      const newHighlights = {...prev};
      delete newHighlights[verseId];
      return newHighlights;
    });
  };

  const HighlightToolbox = ({ visible, onSelectColor, onClose }) => {
    if (!visible) return null;

    // Stop TTS when opening toolbox
    stopTTS();

    return (
      <View style={styles.toolboxContainer}>
        <View style={styles.toolbox}>
          {highlightColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }]}
              onPress={() => onSelectColor(color)}
            />
          ))}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={async () => {
              await stopTTS();
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Full Screen Background Video */}
      <Video
        ref={setVideoRef}
        source={require('../assets/view.mp4')}
        style={styles.backgroundVideo}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />
      {/* Full Screen Content Overlay */}
      <SafeAreaView style={styles.contentOverlay}>
        {/* Chapter Navigation with Book Name */}
        <View style={styles.chapterNav}>
          <TouchableOpacity 
            style={[styles.navButton, currentChapter === 1 && styles.disabledButton]}
            onPress={goToPrevChapter}
            disabled={currentChapter === 1}
          >
            <Text style={[styles.navButtonText, currentChapter === 1 && styles.disabledText]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.compactTitle}>
              {book.name} {currentChapter}
            </Text>
          </View>

          
          <TouchableOpacity 
            style={[styles.navButton, currentChapter === chapters.length && styles.disabledButton]}
            onPress={goToNextChapter}
            disabled={currentChapter === chapters.length}
          >
            <Text style={[styles.navButtonText, currentChapter === chapters.length && styles.disabledText]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {verses.map((verse, index) => {
            const isHighlighted = highlights[verse.id];
            return (
              <TouchableOpacity 
                key={verse.id} 
                style={[
                  styles.verse, 
                  currentVerseIndex === index && isPlaying && styles.activeVerse,
                  isHighlighted && { backgroundColor: isHighlighted.color }
                ]}
                onPress={() => handleVersePress(verse)}
                onLongPress={() => removeHighlight(verse.id)}
              >
                <Text style={styles.verseNumber}>{verse.number}</Text>
                <Text style={styles.verseText}>
                  {verse.text ? stripHtml(verse.text) : 'Verse text not available'}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {verses.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No content available for this chapter</Text>
            </View>
          )}
        </ScrollView>

        {/* Compact Audio Player */}
        <View style={styles.audioPlayerContainer}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            {/* Speed Controls - Left */}
            <View style={styles.speedControls}>
              <TouchableOpacity 
                style={[styles.speedButton, speechRate === 0.5 && styles.activeSpeedButton]}
                onPress={() => adjustSpeechRate(0.5)}
              >
                <Text style={[styles.speedButtonText, speechRate === 0.5 && styles.activeSpeedText]}>0.5×</Text>
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={goToPrevChapter}
                disabled={currentChapter === 1}
              >
                <Text style={[styles.controlIcon, currentChapter === 1 && styles.disabledIcon]}>|◀</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={stopTTS}
              >
                <Text style={styles.controlIcon}>■</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={togglePlayback}
              >
                <Text style={styles.playIcon}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={goToNextChapter}
                disabled={currentChapter === chapters.length}
              >
                <Text style={[styles.controlIcon, currentChapter === chapters.length && styles.disabledIcon]}>▶|</Text>
              </TouchableOpacity>
            </View>

            {/* Speed Controls - Right */}
            <View style={styles.speedControls}>
              <TouchableOpacity 
                style={[styles.speedButton, speechRate === 1.0 && styles.activeSpeedButton]}
                onPress={() => adjustSpeechRate(1.0)}
              >
                <Text style={[styles.speedButtonText, speechRate === 1.0 && styles.activeSpeedText]}>1×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <HighlightToolbox 
          visible={showToolbox && selectedVerse}
          onSelectColor={handleHighlight}
          onClose={() => setShowToolbox(false)}
        />
      </SafeAreaView>
    </View>
  );
};

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: screenHeight,
    width: screenWidth,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    zIndex: 1,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    zIndex: 2,
    height: screenHeight,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 20,
    color: '#A07553',
    fontWeight: 'bold',
  },
  chapterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.5)',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#A07553',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledText: {
    color: '#999',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent', 
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: screenHeight * 0.6,
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
  },
  activeVerse: {
    backgroundColor: 'rgba(255, 248, 225, 0.9)',
    borderLeftWidth: 3,
    borderLeftColor: '#9E795D',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#AE796D',
    marginRight: 10,
    marginTop: 2,
    minWidth: 24,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: screenHeight * 0.4,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9E795D',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  audioPlayerContainer: {
    backgroundColor: 'rgba(158, 117, 93, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedControls: {
    flexDirection: 'column',
    gap: 4,
    minWidth: 35,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSpeedButton: {
    backgroundColor: '#FFFFFF',
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  activeSpeedText: {
    color: '#9E795D',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledIcon: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playIcon: {
    color: '#9E795D',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 1,
  },
  toolboxContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  toolbox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
  },
});

export default BookContent;