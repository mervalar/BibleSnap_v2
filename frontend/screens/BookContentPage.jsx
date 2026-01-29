import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';
import { Video } from 'expo-av';
import CustomPicker from '../components/CustomPicker';
import biblePreferences from '../api/biblePreferences';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { styles, screenWidth, screenHeight } from '../styles/BookContentPage.styles';

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

const BookContent = (props) => {
  // Support both props (for modal usage) and route params (for navigation)
  const route = useRoute();
  const navigation = props.navigation || useNavigation();
  
  // FIXED: Better handling of params from different sources
  // Check props first (for modal), then route params (for navigation)
  const routeParams = props.route?.params || route?.params || {};
  const params = routeParams;
  const book = params.book || { id: '', name: '' };
  const initialChapter = params.chapter || { number: '1' };
  const routeBibleId = params.bibleId || '65eec8e0b60e656b-01';
  const routeLanguage = params.language || 'english';
  
  // State variables
  const [videoRef, setVideoRef] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(initialChapter ? parseInt(initialChapter.number) : 1);
  const [chapters, setChapters] = useState([]);
  const [highlights, setHighlights] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showToolbox, setShowToolbox] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
  const [language, setLanguage] = useState(routeLanguage || 'english');
  const [bibleId, setBibleId] = useState(routeBibleId || '65eec8e0b60e656b-01');
  const [isSharing, setIsSharing] = useState(false);
  const shareRef = useRef();
  // Constants
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';

  // Initialize and fetch data - re-run when book or bibleId changes
  useEffect(() => {
    if (book && book.id) {
      fetchChapters();
      loadHighlights(); 
    }
    
    return () => {
      saveHighlights(); 
    };
  }, [book?.id, bibleId]);

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
        // Failed to store book info
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
        // Error loading font size preference
      }
    };
    
    loadFontPreference();
  }, []);

  // FIXED: Initialize from route params or props immediately
  useEffect(() => {
    if (routeLanguage) setLanguage(routeLanguage);
    if (routeBibleId) setBibleId(routeBibleId);
  }, [routeBibleId, routeLanguage]);

  const saveHighlights = async () => {
    try {
      if (book && book.id) {
        await AsyncStorage.setItem(`highlights_${book.id}`, JSON.stringify(highlights));
      }
    } catch (e) {
      // Failed to save highlights
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
      setHighlights({});
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
      
      // Don't auto-set to chapter 1, let the initialChapter effect handle it
    } catch (error) {
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
    }
  };

  const fetchChapterContent = async (chapterNum) => {
    try {
      setLoading(true);

      const chapter = chapters.find(c => c.number === chapterNum.toString());
      
      if (!chapter) {
        return;
      }

      // Fetch verses for the chapter
      const versesUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapter.id}/verses`;
      
      const versesResponse = await fetch(versesUrl, { 
        headers: { 'api-key': API_KEY } 
      });
      
      const versesData = await versesResponse.json();
      const chapterVerses = versesData.data || [];

      // Fetch text for each verse
      const versesWithText = await Promise.all(
        chapterVerses.map(async (verse) => {
          try {
            const verseUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verse.id}`;
            const verseDetailResponse = await fetch(verseUrl, { 
              headers: { 'api-key': API_KEY } 
            });
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
      
    } catch (error) {
      Alert.alert('Error', `Failed to load chapter ${chapterNum}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < chapters.length) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
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
      // Error saving font size preference
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