import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import BibleControlBar from '../components/bible/BibleControlBar';
import biblePreferences from '../api/biblePreferences';
import { LANGUAGE_OPTIONS } from '../constants/bibleApi';
import { styles, COLORS, dimensions } from '../styles/ChapterListPage.styles';

const ChaptersListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book, bibleId: initialBibleId } = route.params;

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(route.params?.language || 'english');
  const [bibleId, setBibleId] = useState(initialBibleId || 'de4e12af7f28f599-01');

  const handleLanguageChange = (langValue) => {
    setLanguage(langValue);
    const selected = LANGUAGE_OPTIONS.find(opt => opt.value === langValue);
    if (selected) {
      setBibleId(selected.bibleId);
      biblePreferences.storeLanguagePreference(langValue, selected.bibleId);
    }
  };

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = initialBibleId || 'de4e12af7f28f599-01';
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
      setChapters((data.data || []).filter(c => c.number !== 'intro'));
    } catch (error) {
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
    navigation.navigate('BookContent', { book, chapter, bibleId, language });
  };


  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading && chapters.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#A07553" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <BibleControlBar
          onSavedVerses={() => navigation.navigate('SavedVerses')}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
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
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default ChaptersListPage;