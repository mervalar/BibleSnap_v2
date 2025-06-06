import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ChaptersListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params; // Get the selected book from navigation params
  
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b'; // Replace with your actual API key
  const BIBLE_ID = 'ac6b6b7cd1e93057-01';
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
    // Navigate to chapter content/verses
    navigation.navigate('BookContent', { book, chapter });
    console.log('Selected chapter:', chapter);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A07553" />
        <Text style={styles.loadingText}>Loading Chapters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{book.name}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.name}</Text>
        <Text style={styles.bookSubtitle}>{chapters.length} Chapters</Text>
      </View>

      {/* Chapters List */}
      <ScrollView style={styles.chaptersContainer} showsVerticalScrollIndicator={false}>
        {chapters.map((chapter, index) => (
          <TouchableOpacity
            key={chapter.id}
            style={styles.chapterItem}
            onPress={() => handleChapterPress(chapter)}
          >
            <View style={styles.chapterContent}>
              <Text style={styles.chapterNumber}>Chapter {chapter.number}</Text>
              <Text style={styles.chapterReference}>{chapter.reference}</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        ))}
        
        {chapters.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chapters found for this book</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchChapters}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEDED2',
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    backgroundColor: '#EEDED2',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#A07553',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  bookInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookSubtitle: {
    fontSize: 14,
    color: '#9E795D',
  },
  chaptersContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chapterItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterContent: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  chapterReference: {
    fontSize: 12,
    color: '#9E795D',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#A07553',
    fontWeight: 'bold',
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
});

export default ChaptersListPage;