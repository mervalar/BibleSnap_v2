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
  Platform,
  ToastAndroid
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import SplashScreen from '../components/SplashScreen';
import { Video } from 'expo-av';
import CustomPicker from '../components/CustomPicker';
import biblePreferences from '../api/biblePreferences';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Language options for the Bible
const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'english', bibleId: '65eec8e0b60e656b-01' },
  { label: 'French', value: 'french', bibleId: 'a93a92589195411f-01' },
  { label: 'Swahili', value: 'swahili', bibleId: '611f8eb23aec8f13-01' },
];

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

const BookContent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || {}; // Safely access params
  const book = params.book || { id: '', name: '' };
  const initialChapter = params.chapter || { number: '1' };
  const routeBibleId = params.bibleId || '65eec8e0b60e656b-01';
  const routeLanguage = params.language || 'english';
  
  // State variables
  const [videoRef, setVideoRef] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(initialChapter ? parseInt(initialChapter.number) : 1);
  const [chapters, setChapters] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [highlights, setHighlights] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showToolbox, setShowToolbox] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
  const [language, setLanguage] = useState(routeLanguage || 'english');
  const [bibleId, setBibleId] = useState(routeBibleId || '65eec8e0b60e656b-01');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [chapterText, setChapterText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Refs for tracking
  const progressInterval = useRef(null);
  const startTime = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const shareRef = useRef();
  // Constants
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const highlightColors = ['#FFD700', '#90EE90', '#ADD8E6', '#FFB6C1'];

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

  // This effect runs when chapters are loaded or when currentChapter changes
  useEffect(() => {
    if (chapters.length > 0) {
      fetchChapterContent(currentChapter);
    }
  }, [currentChapter, chapters]);

  // Handle initial chapter if provided in navigation
  useEffect(() => {
    if (initialChapter && chapters.length > 0) {
      // Find the chapter in the loaded chapters
      const chapterNum = parseInt(initialChapter.number);
      if (!isNaN(chapterNum)) {
        setCurrentChapter(chapterNum);
      }
    }
  }, [initialChapter, chapters]);
  
  // Re-fetch chapters when bibleId changes
  useEffect(() => {
    if (book && book.id) {
      fetchChapters();
    }
  }, [bibleId, book]);

  // Store book info for later reference
  useEffect(() => {
    const storeBookInfo = async () => {
      try {
        if (book && book.id) {
          await AsyncStorage.setItem(`book_info_${book.id}`, JSON.stringify({
            id: book.id,
            name: book.name
          }));
        }
      } catch (e) {
        console.error('Failed to store book info', e);
      }
    };
    
    storeBookInfo();
  }, [book]);

  // Load saved font size preference
  useEffect(() => {
    const loadFontPreference = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('bible_font_size');
        if (savedFontSize) {
          setFontSize(parseInt(savedFontSize, 10));
        }
      } catch (error) {
        console.error('Error loading font size preference', error);
      }
    };
    
    loadFontPreference();
  }, []);

  const initializeTTS = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);

      let selected = null;
      if (language === 'english') {
        selected = voices.find(v => v.language.startsWith('en'));
      } else if (language === 'french') {
        selected = voices.find(v => v.language.startsWith('fr'));
      } else if (language === 'swahili') {
        selected = voices.find(v => v.language.startsWith('sw'));
      }

      setSelectedVoice(selected || null);
    } catch (error) {
      console.log('TTS initialization error:', error);
      setSelectedVoice(null);
    }
  };

  const saveHighlights = async () => {
    try {
      if (book && book.id) {
        await AsyncStorage.setItem(`highlights_${book.id}`, JSON.stringify(highlights));
      }
    } catch (e) {
      console.error('Failed to save highlights', e);
    }
  };

  const loadHighlights = async () => {
    try {
      if (!book || !book.id) return;
      
      const highlightsKey = `highlights_${book.id}`;
      const highlightsData = await AsyncStorage.getItem(highlightsKey);
      
      if (highlightsData) {
        setHighlights(JSON.parse(highlightsData));
      } else {
        setHighlights({});
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
      setHighlights({});
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
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${book.id}/chapters`,
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

  // Handle language change
  const handleLanguageChange = (langValue) => {
    setLanguage(langValue);
    const selected = LANGUAGE_OPTIONS.find(opt => opt.value === langValue);
    if (selected) {
      setBibleId(selected.bibleId);
      biblePreferences.storeLanguagePreference(langValue, selected.bibleId);
      initializeTTS(); // Re-initialize TTS for new language
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
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapter.id}/verses`,
        { headers: { 'api-key': API_KEY } }
      );
      const versesData = await versesResponse.json();
      const chapterVerses = versesData.data || [];

      // Fetch text for each verse
      const versesWithText = await Promise.all(
        chapterVerses.map(async (verse) => {
          try {
            const verseDetailResponse = await fetch(
              `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verse.id}`,
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
      if (!selectedVoice) {
        Alert.alert('Voice not found', 'No voice available for this language.');
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
    
    try {
      // Stop TTS if it's playing
      if (isPlaying) {
        await stopTTS();
      }
      
      // Create the highlights object for this verse
      const highlightData = {
        color,
        text: stripHtml(selectedVerse.text),
        reference: `${currentChapter}:${selectedVerse.number}`
      };
      
      // Update local state
      setHighlights(prev => ({
        ...prev,
        [selectedVerse.id]: highlightData
      }));
      
      // Save to AsyncStorage immediately
      const highlightsKey = `highlights_${book.id}`;
      
      // Get existing highlights
      const existingHighlightsStr = await AsyncStorage.getItem(highlightsKey);
      const existingHighlights = existingHighlightsStr ? JSON.parse(existingHighlightsStr) : {};
      
      // Merge with new highlight
      const updatedHighlights = {
        ...existingHighlights,
        [selectedVerse.id]: highlightData
      };
      
      await AsyncStorage.setItem(`book_info_${book.id}`, JSON.stringify({
        id: book.id,
        name: book.name
      }));
      
      // Close the toolbox
      setShowToolbox(false);
      
      // Show a small confirmation
    } catch (error) {
      console.error('Error saving highlight:', error);
      Alert.alert('Error', 'Failed to save the highlighted verse');
    }
  };

  const removeHighlight = (verseId) => {
    setHighlights(prev => {
      const newHighlights = {...prev};
      delete newHighlights[verseId];
      return newHighlights;
    });
  };

  const toggleFontSizeOptions = () => {
    setShowFontSizeOptions(!showFontSizeOptions);
    if (showToolbox) {
      setShowToolbox(false);
    }
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    setShowFontSizeOptions(false);
    // Save user preference if needed
    try {
      AsyncStorage.setItem('bible_font_size', size.toString());
    } catch (error) {
      console.error('Error saving font size preference', error);
    }
  };

  const handleShareVerse = async () => {
    if (!selectedVerse) {
      Alert.alert('No verse selected', 'Please select a verse to share.');
      return;
    }
    setIsSharing(true);
    try {
      // Wait for the UI to update
      setTimeout(async () => {
        const uri = await shareRef.current.capture();
        setIsSharing(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Sharing not available');
        }
      }, 500);
    } catch (error) {
      setIsSharing(false);
      Alert.alert('Error', 'Could not share the verse.');
      console.error(error);
    }
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
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#A07553" />
          </TouchableOpacity>
          
          <Text style={styles.navBarTitle} numberOfLines={1}>
            {book.name} {currentChapter}
          </Text>
        </View>

        {/* Chapter Navigation with Controls */}
        <View style={styles.chapterNavContainer}>
          <TouchableOpacity 
            style={[
              styles.chapterNavButton, 
              currentChapter === 1 && styles.disabledButton
            ]}
            onPress={goToPrevChapter}
            disabled={currentChapter === 1}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentChapter === 1 ? "#CCCCCC" : "#A07553"} 
            />
          </TouchableOpacity>
          
          <View style={styles.chapterControls}>
            <TouchableOpacity 
              style={styles.controlIconButton}
              onPress={() => navigation.navigate('SavedVerses')}
            >
              <Ionicons name="bookmark-outline" size={20} color="#A07553" />
            </TouchableOpacity>
            
            <CustomPicker
              options={LANGUAGE_OPTIONS}
              selectedValue={language}
              onValueChange={handleLanguageChange}
              containerStyle={styles.compactPickerContainer}
              compact={true}
              icon={<Ionicons name="language-outline" size={20} color="#A07553" />}
              colors={{
                primary: '#A07553',
                background: 'rgba(255, 255, 255, 0.95)',
                text: {
                  primary: '#333333',
                  secondary: '#666666',
                },
                border: {
                  light: 'rgba(160, 117, 83, 0.2)',
                },
              }}
            />
            
            <TouchableOpacity 
              style={styles.controlIconButton}
              onPress={toggleFontSizeOptions}
            >
              <Ionicons name="text-outline" size={20} color="#A07553" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.chapterNavButton, 
              currentChapter === chapters.length && styles.disabledButton
            ]}
            onPress={goToNextChapter}
            disabled={currentChapter === chapters.length}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={currentChapter === chapters.length ? "#CCCCCC" : "#A07553"} 
            />
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
                <Text style={[styles.verseText, { fontSize: fontSize, lineHeight: fontSize * 1.6 }]}>
                  {verse.text ? stripHtml(verse.text) : 'Verse text not available'}
                </Text>
                
                {/* Share button */}
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => {
                    setSelectedVerse(verse);
                    handleShareVerse();
                  }}
                >
                  <Ionicons name="share-social-outline" size={22} color="#A07553" />
                </TouchableOpacity>
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
        
        <FontSizeOptions
          visible={showFontSizeOptions}
          onSelectSize={changeFontSize}
          onClose={() => setShowFontSizeOptions(false)}
        />
      </SafeAreaView>

      <ViewShot
        ref={shareRef}
        options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
        style={{ 
          position: 'absolute', 
          left: -9999, 
          width: screenWidth * 0.8, 
          padding: 24,
          backgroundColor: '#111',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 8,
        }}
      >
        {selectedVerse && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', marginBottom: 12 }}>
              {book.name} {currentChapter}:{selectedVerse.number}
            </Text>
            <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center', marginBottom: 8 }}>
              "{stripHtml(selectedVerse.text)}"
            </Text>
            <Text style={{ color: '#fff', fontSize: 6, opacity: 0.7 }}>
              BibleSnap
            </Text>
          </View>
        )}
      </ViewShot>
    </View>
  );
};

// If you're on iOS, replace ToastAndroid with Alert:
// For iOS-compatible toast replacement:
const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, use Alert as a simple toast
    Alert.alert(
      "",
      message,
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true, userInterfaceStyle: 'light' }
    );
  }
};

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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 117, 83, 0.2)',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: 12,
  },
  navBarTitle: {
    flex: 1,
    fontWeight: '600',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginRight: 50, // Balance the back button
  },
  chapterNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 117, 83, 0.1)',
  },
  chapterNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(160, 117, 83, 0.2)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  chapterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(160, 117, 83, 0.2)',
  },
  savedVersesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  savedVersesButtonText: {
    color: '#A07553',
    fontSize: 12,
    fontWeight: '600',
  },
  fontSizeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
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
  languagePickerContainer: {
    width: 100,
    marginTop: 8,
    alignSelf: 'center',
  },
  languagePickerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  compactPickerContainer: {
    width: 60,
    height: 40,
    
  },
  fontSizeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  fontSizePanel: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fontSizeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
  },
  activeFontSizeButton: {
    backgroundColor: '#A07553',
  },
  fontSizeButtonText: {
    color: '#A07553',
    fontSize: 16,
    fontWeight: '500',
  },
  activeFontSizeText: {
    color: '#FFFFFF',
  },
  closeFontSizeButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#A07553',
  },
  closeFontSizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

// Add this component before the export statement
const HighlightToolbox = ({ visible, onSelectColor, onClose }) => {
  if (!visible) return null;
  
  // Softer, pastel highlighter colors with transparency
  const highlightColors = [
    'rgba(255, 235, 59, 0.5)',  
    'rgba(129, 212, 250, 0.5)',  
    'rgba(186, 255, 201, 0.5)',  
    'rgba(255, 183, 197, 0.5)',  
    'rgba(255, 213, 128, 0.5)', 
  ];
  
  return (
    <View style={styles.toolboxContainer}>
      <View style={styles.toolbox}>
        {highlightColors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => onSelectColor(color)}
          />
        ))}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Font size options component
const FontSizeOptions = ({ visible, onSelectSize, onClose }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.fontSizeContainer}>
      <View style={styles.fontSizePanel}>
        <Text style={styles.fontSizeTitle}>Text Size</Text>
        <View style={styles.fontSizeOptions}>
          <TouchableOpacity
            style={[styles.fontSizeButton, { backgroundColor: 'rgba(160, 117, 83, 0.1)' }]}
            onPress={() => onSelectSize(14)}
          >
            <Text style={styles.fontSizeButtonText}>S</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontSizeButton, { backgroundColor: 'rgba(160, 117, 83, 0.1)' }]}
            onPress={() => onSelectSize(16)}
          >
            <Text style={styles.fontSizeButtonText}>M</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontSizeButton, { backgroundColor: 'rgba(160, 117, 83, 0.1)' }]}
            onPress={() => onSelectSize(18)}
          >
            <Text style={styles.fontSizeButtonText}>L</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontSizeButton, { backgroundColor: 'rgba(160, 117, 83, 0.1)' }]}
            onPress={() => onSelectSize(20)}
          >
            <Text style={styles.fontSizeButtonText}>XL</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeFontSizeButton} onPress={onClose}>
          <Text style={styles.closeFontSizeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookContent;