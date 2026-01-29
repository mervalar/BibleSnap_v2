import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from '../components/SplashScreen';
import CustomPicker from '../components/CustomPicker';
import biblePreferences from '../api/biblePreferences';
import { styles, COLORS, dimensions } from '../styles/BooksListPage.styles';

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'english', bibleId: '65eec8e0b60e656b-01' },
  { label: 'French', value: 'french', bibleId: 'a93a92589195411f-01' },
  { label: 'Swahili', value: 'swahili', bibleId: '611f8eb23aec8f13-01' },
];

const BooksListPage = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState('old');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [language, setLanguage] = useState('english');
  const [bibleId, setBibleId] = useState(LANGUAGE_OPTIONS[0].bibleId);

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const API_URL = `https://api.scripture.api.bible/v1/bibles/${bibleId}/books`;

  // Old Testament books (first 39 books)
  const OLD_TESTAMENT_BOOKS = [
    'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
    'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
    'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
  ];

  useEffect(() => {
    // Load saved language preference when component mounts
    const loadLanguagePreference = async () => {
      try {
        const { language: savedLanguage, bibleId: savedBibleId } = await biblePreferences.getLanguagePreference();
        if (savedLanguage && savedBibleId) {
          setLanguage(savedLanguage);
          setBibleId(savedBibleId);
        }
      } catch (error) {
        // Error loading language preference
      }
    };

    loadLanguagePreference();
    fetchBooks();
  }, [bibleId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          'api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(data.data || []);
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to load books from API. Please check your API key and internet connection.',
        [
          { text: 'Retry', onPress: fetchBooks },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBooks = () => {
    return books.filter(book => {
      const inTestament = selectedTestament === 'old'
        ? OLD_TESTAMENT_BOOKS.includes(book.id)
        : !OLD_TESTAMENT_BOOKS.includes(book.id);
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());
      return inTestament && matchesSearch;
    });
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookChapters', { book, bibleId, language });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLanguageChange = (langValue) => {
    setLanguage(langValue);
    const selected = LANGUAGE_OPTIONS.find(opt => opt.value === langValue);
    setBibleId(selected.bibleId);
    
    // Save language preference
    biblePreferences.storeLanguagePreference(langValue, selected.bibleId);
  };

  if (loading && books.length === 0) {
    return (
      <SplashScreen 
        onFinish={() => {}}
        duration={2000} 
      />
    );
  }

  const filteredBooks = getFilteredBooks();
  const testamentBooks = books.filter(book => 
    selectedTestament === 'old'
      ? OLD_TESTAMENT_BOOKS.includes(book.id)
      : !OLD_TESTAMENT_BOOKS.includes(book.id)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading overlay */}
      {loading && books.length > 0 && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>
              Refreshing...
            </Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
          Bible
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerActionButton, showSearch && styles.headerActionButtonActive]} 
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons 
              name="search" 
              size={dimensions.iconSize.medium} 
              color={showSearch ? COLORS.background : COLORS.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => navigation.navigate('SavedVerses')}
          >
            <Ionicons name="bookmark-outline" size={dimensions.iconSize.medium} color={COLORS.primary} />
          </TouchableOpacity>
          <CustomPicker
            options={LANGUAGE_OPTIONS}
            selectedValue={language}
            onValueChange={handleLanguageChange}
            containerStyle={styles.languagePickerContainer}
            colors={COLORS}
          />
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            <TextInput
              style={[styles.searchInput, { fontSize: dimensions.fontSize.body }]}
              placeholder="Search books by name or abbreviation..."
              placeholderTextColor={COLORS.text.tertiary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoFocus={true}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearchTerm('')}
              >
                <Ionicons name="close" size={dimensions.iconSize.small} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Testament Selector */}
        <View style={styles.testamentContainer}>
          <View style={styles.testamentSelector}>
            <TouchableOpacity
              style={[
                styles.testamentButton,
                selectedTestament === 'old' && styles.activeTestamentButton
              ]}
              onPress={() => setSelectedTestament('old')}
            >
              <Ionicons 
                name="library-outline" 
                size={dimensions.iconSize.small} 
                color={selectedTestament === 'old' ? COLORS.background : COLORS.text.secondary}
                style={styles.testamentIcon}
              />
              <Text style={[
                styles.testamentButtonText,
                { fontSize: dimensions.fontSize.caption },
                selectedTestament === 'old' && styles.activeTestamentButtonText
              ]}>
                Old Testament
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testamentButton,
                selectedTestament === 'new' && styles.activeTestamentButton
              ]}
              onPress={() => setSelectedTestament('new')}
            >
              <Ionicons 
                name="book-outline" 
                size={dimensions.iconSize.small} 
                color={selectedTestament === 'new' ? COLORS.background : COLORS.text.secondary}
                style={styles.testamentIcon}
              />
              <Text style={[
                styles.testamentButtonText,
                { fontSize: dimensions.fontSize.caption },
                selectedTestament === 'new' && styles.activeTestamentButtonText
              ]}>
                New Testament
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Testament Stats */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { fontSize: dimensions.fontSize.caption }]}>
              {testamentBooks.length} books • {filteredBooks.length} shown
            </Text>
          </View>
        </View>

        {/* Search Results Info */}
        {searchTerm.trim() && (
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { fontSize: dimensions.fontSize.caption }]}>
              {filteredBooks.length} result{filteredBooks.length !== 1 ? 's' : ''} for "{searchTerm}"
            </Text>
          </View>
        )}

        {/* Books List */}
        <View style={styles.booksContainer}>
          {filteredBooks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons 
                  name={searchTerm.trim() ? "search-outline" : "library-outline"} 
                  size={64} 
                  color={COLORS.border.medium} 
                />
              </View>
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                {searchTerm.trim() 
                  ? 'No books found' 
                  : books.length === 0 
                    ? 'No books loaded' 
                    : 'No books available'
                }
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                {searchTerm.trim() 
                  ? `No books found matching "${searchTerm}" in the ${selectedTestament === 'old' ? 'Old' : 'New'} Testament.`
                  : books.length === 0 
                    ? 'Unable to load books from the API. Please check your connection and try again.'
                    : `No books available in the ${selectedTestament === 'old' ? 'Old' : 'New'} Testament.`
                }
              </Text>
              {(searchTerm.trim() || books.length === 0) && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    if (searchTerm.trim()) {
                      setSearchTerm('');
                    } else {
                      fetchBooks();
                    }
                  }}
                >
                  <Text style={[styles.actionButtonText, { fontSize: dimensions.fontSize.caption }]}>
                    {searchTerm.trim() ? 'Clear search' : 'Retry'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredBooks.map((book, index) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                onPress={() => handleBookPress(book)}
                activeOpacity={0.7}
              >
                <View style={styles.bookContent}>
                  <Text style={[styles.bookName, { fontSize: dimensions.fontSize.subtitle }]}>
                    {book.name}
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={dimensions.iconSize.medium} 
                    color={COLORS.primary} 
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BooksListPage;