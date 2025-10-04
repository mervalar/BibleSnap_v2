import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
  Platform, 
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SavedVersesPage = () => {
  const navigation = useNavigation();
  const [savedVerses, setSavedVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupByBook, setGroupByBook] = useState(true);
  const [colorFilter, setColorFilter] = useState(null);
  const [bookFilter, setBookFilter] = useState(null);

  useEffect(() => {
    loadSavedVerses();
  }, []);

  const loadSavedVerses = async () => {
    try {
      setLoading(true);
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter out highlight keys (they follow the pattern 'highlights_BOOKID')
      const highlightKeys = keys.filter(key => key.startsWith('highlights_'));
      
      // Load all highlight data
      const highlightsData = await Promise.all(
        highlightKeys.map(async (key) => {
          const bookId = key.replace('highlights_', '');
          const bookData = await AsyncStorage.getItem(key);
          const parsed = JSON.parse(bookData);
          
          // Get book name from another AsyncStorage entry or use ID
          let bookName = bookId;
          try {
            const bookInfo = await AsyncStorage.getItem(`book_info_${bookId}`);
            if (bookInfo) {
              const parsedInfo = JSON.parse(bookInfo);
              bookName = parsedInfo.name;
            }
          } catch (e) {
            console.warn('Could not get book name', e);
          }
          
          // Transform the data into an array of verses with book info
          return Object.entries(parsed).map(([verseId, verseData]) => ({
            id: verseId,
            bookId,
            bookName,
            text: verseData.text,
            color: verseData.color,
            reference: verseData.reference || 'Unknown reference',
          }));
        })
      );
      
      // Flatten the array of arrays
      const allVerses = highlightsData.flat();
      setSavedVerses(allVerses);
    } catch (error) {
      console.error('Error loading saved verses', error);
      Alert.alert('Error', 'Failed to load your saved verses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVerse = async (verse) => {
    try {
      // Get the current highlights for this book
      const highlightsKey = `highlights_${verse.bookId}`;
      const highlightsData = await AsyncStorage.getItem(highlightsKey);
      
      if (highlightsData) {
        const highlights = JSON.parse(highlightsData);
        
        // Remove this verse
        delete highlights[verse.id];
        
        // Save the updated highlights
        await AsyncStorage.setItem(highlightsKey, JSON.stringify(highlights));
        
        // Update the UI
        setSavedVerses(prev => prev.filter(v => v.id !== verse.id));
        
        Alert.alert('Success', 'Verse removed from saved verses');
      }
    } catch (error) {
      console.error('Error deleting verse', error);
      Alert.alert('Error', 'Failed to delete the verse');
    }
  };

  const navigateToVerse = (verse) => {
    // Navigate to the BookContentPage with the specific verse
    navigation.navigate('BookContent', {
      book: { id: verse.bookId, name: verse.bookName },
      verseId: verse.id,
      // Extract chapter information from verse ID if available
      chapter: extractChapterFromVerseId(verse.id),
    });
  };

  const extractChapterFromVerseId = (verseId) => {
    // The verse ID often contains chapter information like "GEN.1.1"
    // Try to extract the chapter number
    try {
      const parts = verseId.split('.');
      if (parts.length >= 2) {
        return { number: parts[1] };
      }
    } catch (e) {
      console.warn('Could not extract chapter from verse ID', e);
    }
    return { number: '1' }; // Default to chapter 1
  };

  const toggleGrouping = () => {
    setGroupByBook(!groupByBook);
  };

  // Filter logic
  const getFilteredSavedVerses = () => {
    let filtered = [...savedVerses];
    if (colorFilter) filtered = filtered.filter(verse => verse.color === colorFilter);
    if (bookFilter) filtered = filtered.filter(verse => verse.bookId === bookFilter);
    return filtered;
  };

  const resetFilters = () => {
    setColorFilter(null);
    setBookFilter(null);
  };

  const renderGroupedVerses = () => {
    const filtered = getFilteredSavedVerses();
    // Group verses by book
    const bookGroups = {};
    
    filtered.forEach(verse => {
      if (!bookGroups[verse.bookId]) {
        bookGroups[verse.bookId] = {
          bookId: verse.bookId,
          bookName: verse.bookName,
          verses: []
        };
      }
      bookGroups[verse.bookId].verses.push(verse);
    });
    
    return (
      <FlatList
        data={Object.values(bookGroups)}
        keyExtractor={item => item.bookId}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.bookSection}>
            <Text style={styles.bookHeader}>{item.bookName}</Text>
            {item.verses.map(verse => renderVerseItem(verse))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved verses yet</Text>
            <Text style={styles.emptySubtext}>
              Highlight verses while reading to save them here
            </Text>
          </View>
        }
      />
    );
  };

  const renderFlatVerses = () => {
    const filtered = getFilteredSavedVerses();
    return (
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => renderVerseItem(item)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved verses yet</Text>
            <Text style={styles.emptySubtext}>
              Highlight verses while reading to save them here
            </Text>
          </View>
        }
      />
    );
  };

  const renderVerseItem = (verse) => (
    <TouchableOpacity
      style={[styles.verseCard, { backgroundColor: verse.color + '30' }]} // Add transparency
      onPress={() => navigateToVerse(verse)}
    >
      <View style={styles.verseHeader}>
        <Text style={styles.verseReference}>
          {verse.bookName} {verse.reference}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVerse(verse)}
        >
          <Ionicons name="trash-outline" size={18} color="#777" />
        </TouchableOpacity>
      </View>
      <Text style={styles.verseText}>{verse.text}</Text>
      <View style={[styles.colorStrip, { backgroundColor: verse.color }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Video */}
      <Video
        source={require('../assets/view.mp4')}
        style={styles.backgroundVideo}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />
      
      {/* Content */}
      <SafeAreaView style={styles.contentOverlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#A07553" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Saved Verses</Text>
          
          <TouchableOpacity 
            style={styles.groupButton}
            onPress={toggleGrouping}
          >
            <Ionicons 
              name={groupByBook ? "list" : "albums"} 
              size={24} 
              color="#A07553" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Filter Section */}
        <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', color: '#A07553', fontSize: 16 }}>
            Saved Verses ({getFilteredSavedVerses().length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <TouchableOpacity
              style={[
                { padding: 8, borderRadius: 16, marginRight: 8, backgroundColor: !colorFilter ? '#A07553' : '#eee' }
              ]}
              onPress={() => setColorFilter(null)}
            >
              <Text style={{ color: !colorFilter ? '#fff' : '#A07553' }}>All Colors</Text>
            </TouchableOpacity>
            {/* Add color filter buttons */}
            {['rgba(255, 235, 59, 0.5)','rgba(129, 212, 250, 0.5)','rgba(186, 255, 201, 0.5)','rgba(255, 183, 197, 0.5)','rgba(255, 213, 128, 0.5)'].map(color => (
              <TouchableOpacity
                key={color}
                style={{
                  padding: 8,
                  borderRadius: 16,
                  marginRight: 8,
                  backgroundColor: colorFilter === color ? '#A07553' : color,
                  borderWidth: colorFilter === color ? 2 : 0,
                  borderColor: '#A07553'
                }}
                onPress={() => setColorFilter(colorFilter === color ? null : color)}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, borderWidth: 1, borderColor: '#ccc' }} />
              </TouchableOpacity>
            ))}
            {(colorFilter || bookFilter) && (
              <TouchableOpacity
                style={{ padding: 8, borderRadius: 16, backgroundColor: '#eee' }}
                onPress={resetFilters}
              >
                <Text style={{ color: '#A07553' }}>Reset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        
        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A07553" />
            <Text style={styles.loadingText}>Loading your saved verses...</Text>
          </View>
        ) : (
          groupByBook ? renderGroupedVerses() : renderFlatVerses()
        )}
      </SafeAreaView>
    </View>
  );
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  groupButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom
  },
  bookSection: {
    marginBottom: 24,
  },
  bookHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A07553',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 117, 83, 0.2)',
  },
  verseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A07553',
  },
  deleteButton: {
    padding: 4,
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  colorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A07553',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A07553',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SavedVersesPage;