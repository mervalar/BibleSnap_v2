import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

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
};

const ChaptersListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;
  
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const dimensions = getResponsiveDimensions();

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = 'de4e12af7f28f599-01';
  const API_URL = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`;

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
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
      setChapters(data.data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Alert.alert(
        'Error', 
        'Failed to load chapters from API. Please check your API key and internet connection.',
        [
          { text: 'Retry', onPress: fetchChapters },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChapterPress = (chapter) => {
    navigation.navigate('BookContent', { book, chapter });
    console.log('Selected chapter:', chapter);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading && chapters.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading Chapters...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading overlay */}
      {loading && chapters.length > 0 && (
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
          {book.name}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchChapters}>
          <Ionicons name="refresh" size={dimensions.iconSize.medium} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Info */}
        <View style={styles.bookInfoContainer}>
          <View style={styles.bookHeader}>
            <View style={styles.bookIconContainer}>
              <Ionicons 
                name="book" 
                size={dimensions.iconSize.large} 
                color={COLORS.primary} 
              />
            </View>
            <View style={styles.bookDetails}>
              <Text style={[styles.bookTitle, { fontSize: dimensions.fontSize.title }]}>
                {book.name}
              </Text>
              <Text style={[styles.bookSubtitle, { fontSize: dimensions.fontSize.caption }]}>
                {book.abbreviation || book.id} • {chapters.length} chapters
              </Text>
            </View>
          </View>
        </View>

        {/* Chapters List */}
        <View style={styles.chaptersContainer}>
          {chapters.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons 
                  name="document-outline" 
                  size={64} 
                  color={COLORS.border.medium} 
                />
              </View>
              <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                No Chapters Found
              </Text>
              <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>
                Unable to load chapters for {book.name}. Please check your connection and try again.
              </Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={fetchChapters}
              >
                <Text style={[styles.actionButtonText, { fontSize: dimensions.fontSize.caption }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chaptersList}>
              {chapters.map((chapter, index) => {
                // Extract chapter number from reference or use chapter.number
                const chapterNumber = chapter.number || 
                  (chapter.reference ? chapter.reference.split(' ').pop() : (index + 1).toString());
                
                return (
                  <TouchableOpacity
                    key={chapter.id}
                    style={styles.chapterCard}
                    onPress={() => handleChapterPress(chapter)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chapterContent}>
                      <Text style={[styles.chapterText, { fontSize: dimensions.fontSize.body }]}>
                        Chapter {chapterNumber}
                      </Text>
                    </View>
                    <View style={styles.chapterArrow}>
                      <Ionicons 
                        name="chevron-forward" 
                        size={dimensions.iconSize.small} 
                        color={COLORS.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: dimensions.spacing.md,
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
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  bookInfoContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    padding: dimensions.spacing.md,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: dimensions.spacing.md,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    marginBottom: dimensions.spacing.xs,
  },
  bookSubtitle: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chaptersContainer: {
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
  chaptersList: {
    // Removed flexDirection: 'row' and flexWrap: 'wrap' to make each card take full width
  },
  chapterCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: dimensions.spacing.sm, // Reduced padding to make cards smaller
    width: '100%', // Full width instead of 48%
    minHeight: 50, // Reduced from 80 to make cards smaller
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: dimensions.spacing.sm,
    flexDirection: 'row', // Added to align text and arrow horizontally
    alignItems: 'center',
  },
  chapterContent: {
    flex: 1,
    justifyContent: 'center',
    // Removed alignItems: 'center' to align text to the left
  },
  chapterText: {
    color: COLORS.text.primary,
    fontWeight: '600',
    // Simple text instead of the complex number container
  },
  chapterArrow: {
    // Removed position: 'absolute' and adjusted positioning
    marginLeft: dimensions.spacing.sm,
  },
});

export default ChaptersListPage;