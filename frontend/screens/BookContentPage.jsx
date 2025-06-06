import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const BookContent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params; // Get selected book from navigation
  
  const [verses, setVerses] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // API Configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = 'a93a92589195411f-01';

  useEffect(() => {
    fetchCompleteBookContent();
  }, []);

  // Fetch all chapters and verses for the book
  const fetchCompleteBookContent = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get all chapters
      const chaptersResponse = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`,
        {
          headers: { 'api-key': API_KEY },
        }
      );
      
      const chaptersData = await chaptersResponse.json();
      const chapters = chaptersData.data || [];
      
      // Step 2: Get verses for each chapter
      let allVerses = [];
      
      for (const chapter of chapters) {
        try {
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
                  chapterNumber: chapter.number,
                  chapterReference: chapter.reference,
                  text: verseDetailData.data?.content || '', // or .text depending on API
                };
              } catch (err) {
                return {
                  ...verse,
                  chapterNumber: chapter.number,
                  chapterReference: chapter.reference,
                  text: '',
                };
              }
            })
          );

          allVerses = [...allVerses, ...versesWithText];
        } catch (error) {
          console.error(`Error fetching verses for chapter ${chapter.number}:`, error);
        }
      }
      
      setVerses(allVerses);
      
      // Step 3: Try to get audio (if available)
      await fetchAudioUrl();
      
    } catch (error) {
      console.error('Error fetching book content:', error);
      Alert.alert('Error', 'Failed to load book content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audio URL for the book
  const fetchAudioUrl = async () => {
    try {
      // Example endpoint for audio: adjust as needed for your API
      const audioResponse = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/audio`,
        { headers: { 'api-key': API_KEY } }
      );

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        setAudioUrl(audioData.data?.url || null);
      }
    } catch (error) {
      console.error('Audio not available:', error);
      // Audio might not be available, that's ok
    }
  };

  const togglePlayback = () => {
    if (audioUrl) {
      setIsPlaying(!isPlaying);
      // Here you would integrate with your audio player
      console.log('Toggle audio playback:', !isPlaying);
    } else {
      Alert.alert('Audio Not Available', 'Audio is not available for this book.');
    }
  };

  // Group verses by chapter for better display
  const versesByChapter = verses.reduce((acc, verse) => {
    const chapterNum = verse.chapterNumber;
    if (!acc[chapterNum]) {
      acc[chapterNum] = [];
    }
    acc[chapterNum].push(verse);
    return acc;
  }, {});

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9E795D" />
          <Text style={styles.loadingText}>Loading {book.name}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{book.name}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.name}</Text>
        <Text style={styles.bookSubtitle}>
          {Object.keys(versesByChapter).length} Chapters • {verses.length} Verses
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {Object.entries(versesByChapter).map(([chapterNum, chapterVerses]) => (
          <View key={chapterNum} style={styles.chapterSection}>
            <Text style={styles.chapterTitle}>Chapter {chapterNum}</Text>
            
            {chapterVerses.map((verse) => (
              <View key={verse.id} style={styles.verse}>
                <Text style={styles.verseNumber}>{verse.number}</Text>
                <Text style={styles.verseText}>
                  {verse.text ? stripHtml(verse.text) : 'Verse text not available'}
                </Text>
              </View>
            ))}
          </View>
        ))}
        
        {verses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content available for this book</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchCompleteBookContent}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Audio Player (if audio is available) */}
      {audioUrl && (
        <View style={styles.audioPlayerContainer}>
          <View style={styles.audioControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.audioTitle}>{book.name} - Audio</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEDED2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#9E795D',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 20,
    color: '#A07553',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#333',
  },
  bookInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookSubtitle: {
    fontSize: 14,
    color: '#9E795D',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  chapterSection: {
    marginBottom: 24,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A07553',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AE796D',
    marginRight: 8,
    marginTop: 2,
    minWidth: 20,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#9E795D',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#A07553',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#EEDED2',
    fontWeight: '600',
    fontSize: 14,
  },
  audioPlayerContainer: {
    backgroundColor: '#9E795D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 24,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#9E795D',
    fontSize: 18,
    marginLeft: 2,
  },
  audioTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default BookContent;