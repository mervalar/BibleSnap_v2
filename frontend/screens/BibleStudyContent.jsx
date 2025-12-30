import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import BookContent from './BookContentPage';
import BottomNavBar from '../components/BottomNavBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

const COLORS = {
  primary: '#8B5D33',
  accent: '#4A6741',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  overlay: 'rgba(45, 36, 23, 0.75)',
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
  },
};

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

const CelebrationOverlay = ({ visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnims = useRef(
    Array.from({ length: 50 }, () => {
      const startX = Math.random() * screenWidth;
      const startY = -50 - Math.random() * 100; // Start above screen
      const endY = screenHeight + 100; // End below screen
      const horizontalDrift = (Math.random() - 0.5) * 200; // Random horizontal movement
      const initialRotation = Math.random() * 360;
      const finalRotation = initialRotation + 360 + Math.random() * 180;
      
      return {
        translateY: new Animated.Value(startY),
        translateX: new Animated.Value(0),
        rotate: new Animated.Value(initialRotation),
        scale: new Animated.Value(0),
        startX,
        startY,
        endY,
        horizontalDrift,
        initialRotation,
        finalRotation,
      };
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      
      // Animate message
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti/balloons falling
      confettiAnims.forEach((anim, index) => {
        // Reset position
        anim.translateY.setValue(anim.startY);
        anim.translateX.setValue(0);
        anim.scale.setValue(0);
        
        const delay = index * 20; // Stagger the animations
        const duration = 2000 + Math.random() * 1000; // Vary duration
        
        Animated.parallel([
          // Fall down
          Animated.timing(anim.translateY, {
            toValue: anim.endY,
            duration,
            delay,
            useNativeDriver: true,
          }),
          // Drift horizontally
          Animated.timing(anim.translateX, {
            toValue: anim.horizontalDrift,
            duration,
            delay,
            useNativeDriver: true,
          }),
          // Rotate while falling
          Animated.timing(anim.rotate, {
            toValue: anim.finalRotation,
            duration,
            delay,
            useNativeDriver: true,
          }),
          // Scale in and out
          Animated.sequence([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.8,
              duration: duration - 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });

      // Fade out message after 2.5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2500);
    } else {
      // Reset when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnims.forEach(anim => {
        anim.translateY.setValue(anim.startY);
        anim.translateX.setValue(0);
        anim.scale.setValue(0);
        anim.rotate.setValue(anim.initialRotation);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F8B500', '#FF69B4', '#32CD32', '#FF8C00'];

  return (
    <View style={styles.celebrationOverlay} pointerEvents="none">
      {confettiAnims.map((anim, index) => {
        const size = 12 + Math.random() * 16; // Vary sizes
        return (
          <Animated.View
            key={index}
            style={[
              styles.confettiBubble,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                width: size,
                height: size,
                borderRadius: size / 2,
                left: anim.startX,
                top: anim.startY,
                transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { 
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                },
                { scale: anim.scale },
                ],
              },
            ]}
          />
        );
      })}

      <Animated.View
        style={[
          styles.celebrationMessage,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.celebrationIconCircle}>
          <Ionicons name="checkmark-circle" size={48} color="#4A7742" />
        </View>
        <Text style={styles.celebrationText}>Completed! 🎉</Text>
      </Animated.View>
    </View>
  );
};

const BibleStudyContent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isChecked, setIsChecked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bibleId, setBibleId] = useState('65eec8e0b60e656b-01');
  const [language, setLanguage] = useState('english');
  const scrollViewRef = useRef(null);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const currentProgressRef = useRef(1); // Use ref to track current progress
  const [currentProgress, setCurrentProgress] = useState(1); // Start from 1% instead of 0%
  
  const reading = route?.params?.bibleReading || {};
  const allReadings = route?.params?.allReadings || [];
  const [apiBooks, setApiBooks] = useState([]);
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';

  // Load Bible preferences
  useEffect(() => {
    const loadBiblePreferences = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        const savedBibleId = await AsyncStorage.getItem('selectedBibleId');
        
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedBibleId) setBibleId(savedBibleId);
      } catch (error) {
        console.error('Error loading Bible preferences:', error);
      }
    };
    
    loadBiblePreferences();
  }, []);

  // Fetch books list from API for book ID mapping
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const cacheKey = `api_books_${bibleId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setApiBooks(JSON.parse(cached));
          return;
        }

        const response = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/books`,
          { headers: { 'api-key': API_KEY } }
        );
        
        if (response.ok) {
          const data = await response.json();
          const books = data.data || [];
          setApiBooks(books);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(books));
        }
      } catch (error) {
        console.error('Error fetching books list:', error);
      }
    };

    if (bibleId) {
      fetchBooks();
    }
  }, [bibleId]);

  // Initialize progress when component mounts
  useEffect(() => {
    const initializeProgress = async () => {
      try {
        const progressData = await AsyncStorage.getItem('bibleProgress');
        if (progressData) {
          const progressMap = JSON.parse(progressData);
          const savedProgress = progressMap[reading.id];
          if (savedProgress !== undefined && savedProgress >= 1) {
            const progressValue = Math.min(100, savedProgress);
            currentProgressRef.current = progressValue;
            setCurrentProgress(progressValue);
            // Notify parent of current progress
            if (route?.params?.onProgressUpdate) {
              route.params.onProgressUpdate(progressValue);
            }
          } else {
            // Start from 1% and notify parent
            currentProgressRef.current = 1;
            setCurrentProgress(1);
            if (route?.params?.onProgressUpdate) {
              route.params.onProgressUpdate(1);
            }
          }
        } else {
          // No progress exists, start from 1%
          currentProgressRef.current = 1;
          setCurrentProgress(1);
          if (route?.params?.onProgressUpdate) {
            route.params.onProgressUpdate(1);
          }
        }
      } catch (error) {
        console.error('Error initializing progress:', error);
        setCurrentProgress(1);
      }
    };
    
    if (reading.id) {
      initializeProgress();
    }
  }, [reading.id, route?.params?.onProgressUpdate]);

  // Load initial progress when screen comes into focus or reading changes
  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const completed = await AsyncStorage.getItem(`lesson_${reading.id}_completed`);
          setIsChecked(completed === 'true');
          
          // Load saved progress (start from 1% if no progress exists)
          const progressData = await AsyncStorage.getItem('bibleProgress');
          if (progressData) {
            const progressMap = JSON.parse(progressData);
            const savedProgress = progressMap[reading.id];
            if (savedProgress !== undefined && savedProgress >= 1) {
              const progressValue = Math.max(1, Math.min(100, savedProgress));
              currentProgressRef.current = progressValue;
              setCurrentProgress(progressValue);
            } else {
              currentProgressRef.current = 1;
              setCurrentProgress(1); // Start from 1%
            }
          } else {
            currentProgressRef.current = 1;
            setCurrentProgress(1); // Start from 1%
          }
        } catch (error) {
          console.error('Error loading progress:', error);
          setIsChecked(false);
          currentProgressRef.current = 1;
          setCurrentProgress(1); // Default to 1%
        }
      };
      loadProgress();
    }, [reading.id])
  );

  // Update progress based on scroll position
  const updateProgressFromScroll = useCallback(async (contentHeight, scrollY, layoutHeight) => {
    if (contentHeight <= 0) return;
    
    // Calculate how much of the content has been viewed
    const scrolledHeight = scrollY + layoutHeight;
    const progressRatio = Math.min(1, Math.max(0, scrolledHeight / contentHeight));
    
    // Convert to percentage (1% to 100%)
    // Start from 1% and go up to 100%
    const newProgress = Math.max(1, Math.min(100, Math.round(progressRatio * 99) + 1));
    
    // Only update if progress increased (don't decrease progress)
    if (newProgress > currentProgressRef.current) {
      currentProgressRef.current = newProgress;
      setCurrentProgress(newProgress);
      
      // Save progress to AsyncStorage
      try {
        const progressData = await AsyncStorage.getItem('bibleProgress');
        const progressMap = progressData ? JSON.parse(progressData) : {};
        progressMap[reading.id] = newProgress;
        await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
        
        // Update parent component
        if (route?.params?.onProgressUpdate) {
          route.params.onProgressUpdate(newProgress);
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  }, [reading.id, route?.params?.onProgressUpdate]);

  const handleCheckToggle = async () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    
    try {
      if (newChecked) {
        // Use current timestamp for completion
        const completionTimestamp = Date.now();
        await AsyncStorage.setItem(`lesson_${reading.id}_completed_date`, completionTimestamp.toString());
        await AsyncStorage.setItem(`lesson_${reading.id}_completed`, 'true');
        
        const progressData = await AsyncStorage.getItem('bibleProgress');
        const progressMap = progressData ? JSON.parse(progressData) : {};
        // Use current progress or 100%, whichever is higher
        const finalProgress = Math.max(currentProgressRef.current, 100);
        progressMap[reading.id] = finalProgress;
        await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
        currentProgressRef.current = 100;
        setCurrentProgress(100);
        
        const completedData = await AsyncStorage.getItem('completedStudies');
        const completedIds = completedData ? JSON.parse(completedData) : [];
        if (!completedIds.includes(reading.id)) {
          completedIds.push(reading.id);
          await AsyncStorage.setItem('completedStudies', JSON.stringify(completedIds));
        }
        
        // Track daily reading activity
        const today = new Date().toISOString().split('T')[0];
        const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
        const history = dailyHistory ? JSON.parse(dailyHistory) : {};
        history[today] = (history[today] || 0) + 1;
        await AsyncStorage.setItem('dailyReadingHistory', JSON.stringify(history));
        await AsyncStorage.setItem('lastReadingDate', new Date().toISOString());
        
        // Update reading streak
        const lastReadingDate = await AsyncStorage.getItem('lastReadingDate');
        if (lastReadingDate) {
          const lastDate = new Date(lastReadingDate);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          lastDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 1) {
            // Continue or start streak
            const currentStreak = await AsyncStorage.getItem('readingStreak');
            const streak = currentStreak ? parseInt(currentStreak, 10) : 0;
            await AsyncStorage.setItem('readingStreak', (daysDiff === 0 ? streak : streak + 1).toString());
          }
        } else {
          await AsyncStorage.setItem('readingStreak', '1');
        }
        
        if (route?.params?.onProgressUpdate) {
          route.params.onProgressUpdate(Math.max(currentProgressRef.current, 100));
        }
        
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      } else {
        await AsyncStorage.removeItem(`lesson_${reading.id}_completed_date`);
        await AsyncStorage.removeItem(`lesson_${reading.id}_completed`);
        
        const progressData = await AsyncStorage.getItem('bibleProgress');
        const progressMap = progressData ? JSON.parse(progressData) : {};
        progressMap[reading.id] = 1; // Reset to 1% instead of 0%
        await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
        currentProgressRef.current = 1;
        setCurrentProgress(1);
        
        const completedData = await AsyncStorage.getItem('completedStudies');
        const completedIds = completedData ? JSON.parse(completedData) : [];
        const filtered = completedIds.filter(id => id !== reading.id);
        await AsyncStorage.setItem('completedStudies', JSON.stringify(filtered));
        
        if (route?.params?.onProgressUpdate) {
          route.params.onProgressUpdate(1); // Reset to 1% instead of 0%
        }
      }
    } catch (error) {
      console.error('Error saving completion status:', error);
    }
  };

  const formatBooks = (books) => {
    if (!books) return 'No reading assigned';
    if (Array.isArray(books)) {
      return books.join(', ');
    }
    // Try to parse if it's a JSON string
    if (typeof books === 'string') {
      try {
        const parsed = JSON.parse(books);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
      } catch (e) {
        // Not JSON, continue with string replacement
      }
    }
    return books.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  };

  // Use useMemo to recalculate book info when apiBooks or reading changes
  const bookInfo = useMemo(() => {
    // First, properly parse the books field
    let booksArray = [];
    try {
      if (!reading?.books) {
        // Try to find Genesis in API books, otherwise return null ID
        let defaultBookId = null;
        if (apiBooks.length > 0) {
          const genesisBook = apiBooks.find(b => 
            b.name?.toLowerCase().includes('genesis') ||
            b.abbreviation?.toLowerCase().includes('gen')
          );
          defaultBookId = genesisBook?.id || apiBooks[0]?.id || null;
        }
        return { book: { id: defaultBookId, name: 'Genesis' }, chapter: { number: '1' } };
      }
      
      // Handle different formats
      if (Array.isArray(reading.books)) {
        booksArray = reading.books;
      } else if (typeof reading.books === 'string') {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(reading.books);
          booksArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Not JSON, treat as single string
          booksArray = [reading.books];
        }
      } else {
        booksArray = [reading.books];
      }
    } catch (error) {
      console.error('Error parsing books:', error);
      // Try to find Genesis in API books, otherwise return null ID
      let defaultBookId = null;
      if (apiBooks.length > 0) {
        const genesisBook = apiBooks.find(b => 
          b.name?.toLowerCase().includes('genesis') ||
          b.abbreviation?.toLowerCase().includes('gen')
        );
        defaultBookId = genesisBook?.id || apiBooks[0]?.id || null;
      }
      return { book: { id: defaultBookId, name: 'Genesis' }, chapter: { number: '1' } };
    }

    // Get the first book entry
    const firstBook = booksArray[0] || '';
    if (!firstBook || firstBook === 'No reading assigned') {
      return { book: { id: 'GEN', name: 'Genesis' }, chapter: { number: '1' } };
    }

    // Extract book name and chapter from the first book
    // Examples: "Genesis 1", "Genesis 1-2", "1 Samuel 5", "Psalms 23", "Psalm 23", "Song of Solomon 1"
    let bookName = '';
    let chapterNumber = '1';
    
    // Remove any brackets or quotes that might be left
    const cleanBook = String(firstBook).replace(/[\[\]"]/g, '').trim();
    
    // Strategy: Find the chapter number - it's usually the last number in the string
    // Handle formats like: "Genesis 1", "Genesis 1:1", "1 Samuel 5", "Song of Solomon 1"
    
    // First, check for chapter:verse format (e.g., "Genesis 1:1")
    const chapterVerseMatch = cleanBook.match(/(\d+):(\d+)/);
    if (chapterVerseMatch) {
      chapterNumber = chapterVerseMatch[1];
      bookName = cleanBook.substring(0, chapterVerseMatch.index).trim();
    } else {
      // Find all numbers in the string
      const allNumbers = cleanBook.match(/\d+/g);
      
      if (allNumbers && allNumbers.length > 0) {
        // For books with numbers in the name (1 Samuel, 2 Kings, etc.)
        // The pattern is usually: "[Number] [Book Name] [Chapter Number]"
        // So if there are 2+ numbers, the last one is the chapter
        
        if (allNumbers.length === 1) {
          // Single number - could be book number or chapter
          // Check if it's at the start (likely book number) or end (likely chapter)
          const numberStr = allNumbers[0];
          const numberIndex = cleanBook.indexOf(numberStr);
          const wordsBeforeNumber = cleanBook.substring(0, numberIndex).trim().split(/\s+/).filter(w => w).length;
          
          if (wordsBeforeNumber === 0) {
            // Number at start - it's part of book name, default to chapter 1
            bookName = cleanBook.trim();
            chapterNumber = '1';
          } else {
            // Number after text - it's the chapter
            chapterNumber = numberStr;
            bookName = cleanBook.substring(0, numberIndex).trim();
          }
        } else {
          // Multiple numbers - last one is the chapter, everything before is book name
          const lastNumber = allNumbers[allNumbers.length - 1];
          const lastNumberIndex = cleanBook.lastIndexOf(lastNumber);
          chapterNumber = lastNumber;
          bookName = cleanBook.substring(0, lastNumberIndex).trim();
        }
      } else {
        // No numbers found - use entire string as book name, default to chapter 1
        bookName = cleanBook.trim();
        chapterNumber = '1';
      }
    }
    
    // Clean up book name - remove any trailing spaces, dashes, or special characters
    bookName = bookName.replace(/[\s\-:]+$/, '').replace(/\s+/g, ' ').trim();
    
    // Normalize book names (handle common abbreviations and variations)
    bookName = bookName
      .replace(/\bPs\b/i, 'Psalms')
      .replace(/\bPsalm\b/i, 'Psalms')
      .replace(/\bGen\b/i, 'Genesis')
      .replace(/\bExo\b/i, 'Exodus')
      .replace(/\bLev\b/i, 'Leviticus')
      .replace(/\bNum\b/i, 'Numbers')
      .replace(/\bDeut\b/i, 'Deuteronomy')
      .replace(/\b1\s+Sam\b/i, '1 Samuel')
      .replace(/\b2\s+Sam\b/i, '2 Samuel')
      .replace(/\b1\s+Kings?\b/i, '1 Kings')
      .replace(/\b2\s+Kings?\b/i, '2 Kings')
      .replace(/\b1\s+Cor\b/i, '1 Corinthians')
      .replace(/\b2\s+Cor\b/i, '2 Corinthians')
      .trim();
    
    // Try to find book ID from API books list first
    let bookId = null;
    if (apiBooks.length > 0) {
      // Debug: log first few books to see structure
      if (apiBooks.length > 0 && apiBooks[0]) {
        console.log('🔍 Sample API book structure:', {
          id: apiBooks[0].id,
          name: apiBooks[0].name,
          abbreviation: apiBooks[0].abbreviation,
          lookingFor: bookName
        });
      }
      
      // Try exact match first
      let foundBook = apiBooks.find(b => 
        b.name?.toLowerCase() === bookName.toLowerCase() ||
        b.abbreviation?.toLowerCase() === bookName.toLowerCase()
      );
      
      // Try partial match if exact match fails
      if (!foundBook) {
        foundBook = apiBooks.find(b => 
          b.name?.toLowerCase().includes(bookName.toLowerCase()) ||
          bookName.toLowerCase().includes(b.name?.toLowerCase())
        );
      }
      
      // Try matching with normalized names (remove "The" prefix, handle "1st", "2nd", etc.)
      if (!foundBook) {
        const normalizeName = (name) => {
          return name.toLowerCase()
            .replace(/^the\s+/, '')
            .replace(/\b1st\b|\bfirst\b/g, '1')
            .replace(/\b2nd\b|\bsecond\b/g, '2')
            .replace(/\b3rd\b|\bthird\b/g, '3')
            .trim();
        };
        
        const normalizedBookName = normalizeName(bookName);
        foundBook = apiBooks.find(b => {
          const normalizedApiName = normalizeName(b.name || '');
          return normalizedApiName === normalizedBookName ||
                 normalizedApiName.includes(normalizedBookName) ||
                 normalizedBookName.includes(normalizedApiName);
        });
      }
      
      if (foundBook) {
        bookId = foundBook.id;
        console.log('✅ Found book in API:', { name: foundBook.name, id: foundBook.id, abbreviation: foundBook.abbreviation });
      } else {
        console.log('❌ Book not found in API by name, trying abbreviation lookup...');
      }
    }
    
    // If we still don't have a book ID and API books are loaded, try abbreviation lookup
    if (!bookId && apiBooks.length > 0) {
      // Create abbreviation mapping for lookup
      const bookAbbrevMapping = {
        'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
        'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
        '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
        '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
        'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA',
        'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG',
        'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK',
        'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO',
        'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
        'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC',
        'Malachi': 'MAL',
        'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
        'Acts': 'ACT', 'Romans': 'ROM', 
        '1 Corinthians': '1CO', '2 Corinthians': '2CO',
        'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP',
        'Colossians': 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
        '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM',
        'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
        '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD',
        'Revelation': 'REV',
      };
      const abbrev = bookAbbrevMapping[bookName];
      if (abbrev) {
        // Look up by abbreviation OR by ID in API books (API book IDs ARE the abbreviations)
        const foundByAbbrev = apiBooks.find(b => 
          b.abbreviation?.toUpperCase() === abbrev.toUpperCase() ||
          b.id?.toUpperCase() === abbrev.toUpperCase()
        );
        if (foundByAbbrev) {
          bookId = foundByAbbrev.id;
          console.log('✅ Found book by abbreviation lookup:', { abbrev, foundId: foundByAbbrev.id, name: foundByAbbrev.name });
        } else {
          console.log('❌ Book not found by abbreviation:', abbrev, 'Available books:', apiBooks.slice(0, 5).map(b => ({ id: b.id, name: b.name, abbrev: b.abbreviation })));
        }
      }
    }
    
    // Final fallback: if still no ID and API books are loaded, try to find Genesis
    let finalBookId = bookId;
    if (!finalBookId && apiBooks.length > 0) {
      console.log('⚠️ No book ID found yet, trying Genesis fallback...');
      const genesisBook = apiBooks.find(b => 
        b.name?.toLowerCase().includes('genesis') ||
        b.abbreviation?.toLowerCase().includes('gen') ||
        b.id?.toUpperCase() === 'GEN'
      );
      if (genesisBook) {
        finalBookId = genesisBook.id;
        console.log('✅ Using Genesis fallback:', { id: genesisBook.id, name: genesisBook.name });
      } else if (apiBooks.length > 0) {
        // Last resort: use first book
        finalBookId = apiBooks[0]?.id || null;
        console.log('⚠️ Using first book as last resort:', { id: apiBooks[0]?.id, name: apiBooks[0]?.name });
      }
    }
    
    console.log('📖 Book parsing result:', {
      original: reading?.books,
      extractedBookName: bookName,
      extractedChapter: chapterNumber,
      finalBookId: finalBookId,
      apiBooksLoaded: apiBooks.length > 0,
      apiBooksCount: apiBooks.length,
      bookIdBeforeFallback: bookId
    });
    
    if (!finalBookId) {
      console.warn('⚠️ Could not determine book ID for:', bookName, 'API books available:', apiBooks.length);
    }
    
    const finalBookName = bookName || 'Genesis';
    const finalChapterNumber = chapterNumber || '1';
    
    return {
      book: { id: finalBookId, name: finalBookName },
      chapter: { number: finalChapterNumber }
    };
  }, [reading?.books, apiBooks, reading?.id]); // Recalculate when these change

  // Keep getBookInfo function for compatibility
  const getBookInfo = () => bookInfo;

  const handleNext = () => {
    if (!allReadings || allReadings.length === 0) {
      console.log('No next reading available');
      return;
    }

    const currentIndex = allReadings.findIndex(r => r.id === reading.id);
    
    if (currentIndex === -1 || currentIndex >= allReadings.length - 1) {
      console.log('Last reading reached');
      return;
    }

    const nextReading = allReadings[currentIndex + 1];
    
    navigation.replace('BibleStudyContent', {
      bibleReading: nextReading,
      allReadings: allReadings,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <VideoBackground />
      <CelebrationOverlay visible={showCelebration} />
      
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={dimensions.iconSize.large} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          scrollYRef.current = contentOffset.y;
          contentHeightRef.current = contentSize.height;
          
          // Update progress based on scroll
          updateProgressFromScroll(
            contentSize.height,
            contentOffset.y,
            layoutMeasurement.height
          );
        }}
        scrollEventThrottle={100} // Update every 100ms for smooth progress tracking
        onContentSizeChange={(contentWidth, contentHeight) => {
          contentHeightRef.current = contentHeight;
        }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          // Initial progress calculation when layout is known
          if (contentHeightRef.current > 0) {
            updateProgressFromScroll(
              contentHeightRef.current,
              scrollYRef.current,
              height
            );
          }
        }}
      >
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Today's Verse</Text>
          <Text style={styles.dayLabel}>Day {reading?.day || '1'}</Text>
        </View>

        <View style={styles.descriptionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={dimensions.iconSize.medium} color={COLORS.primary} />
            <Text style={styles.cardHeaderText}>{reading?.theme || 'Daily Reading'}</Text>
          </View>
          <Text style={styles.descriptionText}>
            {reading?.explanation || 'Discover today\'s spiritual message and grow in faith through scripture study.'}
          </Text>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <View style={styles.readingTitleContainer}>
              <Ionicons name="bookmarks" size={dimensions.iconSize.small} color={COLORS.primary} />
              <Text style={styles.readingTitle}>Today's Reading</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              onPress={handleCheckToggle}
            >
              {isChecked && (
                <Ionicons name="checkmark" size={16} color={COLORS.background} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bookToRead}>
            <TouchableOpacity style={styles.bookItem} onPress={() => setShowBookModal(true)}>
              <View style={styles.bookInfo}>
                <Ionicons name="book-outline" size={dimensions.iconSize.medium} color={COLORS.primary} />
                <Text style={styles.bookText}>{formatBooks(reading?.books)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={dimensions.iconSize.medium} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {reading?.next_title && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingSectionTitle}>Up Next</Text>
            <TouchableOpacity style={styles.upcomingCard} onPress={handleNext}>
              <View style={styles.upcomingContent}>
                <View style={styles.upcomingIcon}>
                  <Ionicons name="calendar-outline" size={dimensions.iconSize.medium} color={COLORS.accent} />
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingDay}>Day {(reading?.day || 0) + 1}</Text>
                  <Text style={styles.upcomingTitle} numberOfLines={2}>
                    {reading.next_title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={dimensions.iconSize.medium} color={COLORS.text.light} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.noteButton}
          onPress={() => {
            navigation.navigate('Journal', {
              verse: reading?.main_verse || '',
              verseText: reading?.verse_text || reading?.explanation || '',
              category: reading?.category || null,
              fromBibleStudy: true,
            });
          }}
        >
          <Ionicons name="create-outline" size={dimensions.iconSize.medium} color={COLORS.background} />
          <Text style={styles.noteButtonText}>Take a Note</Text>
        </TouchableOpacity>
      </ScrollView>

  <Modal
  visible={showBookModal}
  animationType="slide"
  transparent={false}
  onRequestClose={() => setShowBookModal(false)}
>
  <View style={styles.modalContainer}>
    <TouchableOpacity 
      style={styles.modalCloseButton}
      onPress={() => setShowBookModal(false)}
    >
      <View style={styles.modalCloseButtonInner}>
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </View>
    </TouchableOpacity>

    {(() => {
      const bookInfo = getBookInfo();
      console.log('🚀 About to render BookContent with:', {
        bookId: bookInfo.book.id,
        bookName: bookInfo.book.name,
        chapter: bookInfo.chapter.number,
        bibleId: bibleId
      });
      // Only render BookContent if we have a valid book ID
      if (!bookInfo.book.id) {
        console.warn('⚠️ No book ID, showing loading message');
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              Loading Bible content...
            </Text>
          </View>
        );
      }
      return (
        <BookContent
          route={{
            params: {
              book: bookInfo.book,
              chapter: bookInfo.chapter,
              bibleId: bibleId,
              language: language,
            }
          }}
          navigation={navigation}
        />
      );
    })()}
  </View>
</Modal>
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
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
    backgroundColor: COLORS.overlay,
    zIndex: 0,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: dimensions.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: dimensions.spacing.xl * 2,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: dimensions.spacing.xl,
  },
  mainTitle: {
    fontSize: dimensions.fontSize.title * 1.4,
    fontWeight: '800',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.sm,
    letterSpacing: 1,
  },
  dayLabel: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.light,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 20,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  cardHeaderText: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: dimensions.spacing.sm,
  },
  descriptionText: {
    fontSize: dimensions.fontSize.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  readingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.xl,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
    paddingBottom: dimensions.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  readingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: dimensions.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.semantic.success,
    borderColor: COLORS.semantic.success,
  },
  bookToRead: {
    marginBottom: dimensions.spacing.lg,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: dimensions.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: dimensions.spacing.sm,
  },
  bookText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  upcomingSection: {
    marginTop: dimensions.spacing.sm,
  },
  upcomingSectionTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.md,
  },
  upcomingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.md,
  },
  upcomingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dimensions.spacing.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingDay: {
    fontSize: dimensions.fontSize.caption,
    fontWeight: '600',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.xs,
  },
  upcomingTitle: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  noteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.lg,
    borderRadius: 12,
    marginTop: dimensions.spacing.lg,
    gap: dimensions.spacing.sm,
  },
  noteButtonText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '700',
    color: COLORS.background,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  confettiBubble: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  celebrationMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  celebrationIconCircle: {
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    zIndex: 9999,
  },
  modalCloseButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 93, 51, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default BibleStudyContent;