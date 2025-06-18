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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

const BookContent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params;
  
  const [verses, setVerses] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapters, setChapters] = useState([]);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const soundRef = useRef(null);

  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';
  const BIBLE_ID = 'de4e12af7f28f599-01';

  useEffect(() => {
    fetchChapters();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (chapters.length > 0) {
      fetchChapterContent(currentChapter);
    }
  }, [currentChapter, chapters]);

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
      // Stop current audio when changing chapters
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      }

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
      await fetchAudioUrl(chapter.id);
    } catch (error) {
      console.error(`Error fetching chapter ${chapterNum}:`, error);
      Alert.alert('Error', `Failed to load chapter ${chapterNum}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioUrl = async (chapterId) => {
    try {
      const audioResponse = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapterId}/audio`,
        { headers: { 'api-key': API_KEY } }
      );

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        setAudioUrl(audioData.data?.url || null);
      } else {
        setAudioUrl(null);
      }
    } catch (error) {
      console.error('Audio not available:', error);
      setAudioUrl(null);
    }
  };

  const setupAudioHandlers = (sound) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      setPlaybackStatus(status);
      setIsPlaying(status.isLoaded && status.isPlaying);
      
      // Auto-advance to next chapter when current chapter finishes
      if (status.didJustFinish && currentChapter < chapters.length) {
        setTimeout(() => {
          goToNextChapter();
        }, 1000); // Small delay before auto-advancing
      }
    });
  };

  const togglePlayback = async () => {
    if (!audioUrl) {
      Alert.alert('Audio Not Available', 'Audio is not available for this chapter.');
      return;
    }

    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        if (soundRef.current) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        } else {
          // Load and play new audio
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { 
              shouldPlay: true,
              progressUpdateIntervalMillis: 1000,
            }
          );
          soundRef.current = sound;
          setupAudioHandlers(sound);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error with audio playback:', error);
      Alert.alert('Error', 'Could not play audio. Please try again.');
    }
  };

  const goToNextChapter = async () => {
    if (currentChapter < chapters.length) {
      const wasPlaying = isPlaying;
      setCurrentChapter(currentChapter + 1);
      
      // If audio was playing, automatically start playing the next chapter
      if (wasPlaying) {
        setTimeout(() => {
          togglePlayback();
        }, 500); // Small delay to allow content to load
      }
    }
  };

  const goToPrevChapter = async () => {
    if (currentChapter > 1) {
      const wasPlaying = isPlaying;
      setCurrentChapter(currentChapter - 1);
      
      // If audio was playing, automatically start playing the previous chapter
      if (wasPlaying) {
        setTimeout(() => {
          togglePlayback();
        }, 500); // Small delay to allow content to load
      }
    }
  };

  if (loading && verses.length === 0) {
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

      {/* Chapter Navigation */}
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
        
        <Text style={styles.chapterIndicator}>
          Chapter {currentChapter} of {chapters.length}
        </Text>
        
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

      {/* Content - Removed repetitive chapter title */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {verses.map((verse) => (
          <View key={verse.id} style={styles.verse}>
            <Text style={styles.verseNumber}>{verse.number}</Text>
            <Text style={styles.verseText}>
              {verse.text ? stripHtml(verse.text) : 'Verse text not available'}
            </Text>
          </View>
        ))}
        
        {verses.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content available for this chapter</Text>
          </View>
        )}
      </ScrollView>

      {/* Audio Player */}
      <View style={styles.audioPlayerContainer}>
        <View style={styles.audioControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={goToPrevChapter}
            disabled={currentChapter === 1}
          >
            <Text style={[styles.controlIcon, currentChapter === 1 && styles.disabledIcon]}>⏮</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, !audioUrl && styles.disabledPlayButton]} 
            onPress={togglePlayback}
            disabled={!audioUrl}
          >
            <Text style={[styles.playIcon, !audioUrl && styles.disabledIcon]}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={goToNextChapter}
            disabled={currentChapter === chapters.length}
          >
            <Text style={[styles.controlIcon, currentChapter === chapters.length && styles.disabledIcon]}>⏭</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.audioTitle}>
          {book.name} - Chapter {currentChapter}
          {!audioUrl && ' (Audio Unavailable)'}
          {isPlaying && ' • Playing'}
        </Text>
        
        {/* Progress indicator */}
        {playbackStatus.isLoaded && playbackStatus.durationMillis && (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${(playbackStatus.positionMillis / playbackStatus.durationMillis) * 100}%` 
                }
              ]} 
            />
          </View>
        )}
      </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  chapterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  chapterIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
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
  },
  emptyText: {
    color: '#9E795D',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
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
  disabledIcon: {
    color: '#CCCCCC',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledPlayButton: {
    backgroundColor: '#F0F0F0',
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
    marginBottom: 4,
  },
  progressContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});

export default BookContent;