import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 16 : 12,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 15,
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

// Professional brown color palette
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
    info: '#A07553',
  },
  overlay: 'rgba(160, 117, 83, 0.1)',
  testament: {
    old: '#A07553',
    new: '#8A6344',
  }
};

const BooksListPage = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState('old');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const dimensions = getResponsiveDimensions();

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = 'de4e12af7f28f599-01';
  const API_URL = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`;

  // Old Testament books (first 39 books)
  const OLD_TESTAMENT_BOOKS = [
    'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
    'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
    'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

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
      console.error('Error fetching books:', error);
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
    navigation.navigate('BookChapters', { book });
    console.log('Selected book:', book);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading && books.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading Bible Books...
          </Text>
        </View>
      </SafeAreaView>
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
          Bible Books
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
          <TouchableOpacity style={styles.refreshButton} onPress={fetchBooks}>
            <Ionicons name="refresh" size={dimensions.iconSize.medium} color={COLORS.background} />
          </TouchableOpacity>
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
                  <View style={styles.bookMeta}>
                    <View style={styles.abbreviationBadge}>
                      <Text style={[styles.bookAbbreviation, { fontSize: dimensions.fontSize.caption }]}>
                        {book.abbreviation || book.id}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={dimensions.iconSize.small} 
                      color={COLORS.primary} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.surfaceElevated,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerActionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: dimensions.spacing.sm,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border.light,
    borderRadius: 12,
    marginLeft: dimensions.spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  testamentContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    padding: dimensions.spacing.md,
  },
  testamentSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  testamentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.sm,
    borderRadius: 8,
  },
  activeTestamentButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  testamentIcon: {
    marginRight: dimensions.spacing.xs,
  },
  testamentButtonText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeTestamentButtonText: {
    color: COLORS.background,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: dimensions.spacing.sm,
  },
  statsText: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  resultsText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  booksContainer: {
    padding: dimensions.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xl * 2,
    paddingHorizontal: dimensions.spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    marginBottom: dimensions.spacing.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  emptyTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: dimensions.spacing.lg,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 24,
  },
  actionButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  bookCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: dimensions.cardPadding,
    marginBottom: dimensions.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bookContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookName: {
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: dimensions.spacing.sm,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  abbreviationBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookAbbreviation: {
    color: COLORS.background,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  bookNumber: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bookNumberText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testamentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testamentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: dimensions.spacing.sm,
  },
  testamentLabel: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default BooksListPage;