import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BooksListPage = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState('old'); // 'old' or 'new'

  // Bible API configuration
  const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b'; // Replace with your actual API key
  const BIBLE_ID = 'ac6b6b7cd1e93057-01';
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
      if (selectedTestament === 'old') {
        return OLD_TESTAMENT_BOOKS.includes(book.id);
      } else {
        return !OLD_TESTAMENT_BOOKS.includes(book.id);
      }
    });
  };

  const handleBookPress = (book) => {
    // Navigate to book chapters or content
    navigation.navigate('BookChapters', { book });
    console.log('Selected book:', book);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A07553" />
        <Text style={styles.loadingText}>Loading Books...</Text>
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
        <Text style={styles.headerTitle}>Bible Books</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Testament Selector */}
      <View style={styles.testamentSelector}>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            selectedTestament === 'old' && styles.activeTestamentButton
          ]}
          onPress={() => setSelectedTestament('old')}
        >
          <Text style={[
            styles.testamentButtonText,
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
          <Text style={[
            styles.testamentButtonText,
            selectedTestament === 'new' && styles.activeTestamentButtonText
          ]}>
            New Testament
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <ScrollView style={styles.booksContainer} showsVerticalScrollIndicator={false}>
        {getFilteredBooks().map((book, index) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookItem}
            onPress={() => handleBookPress(book)}
          >
            <View style={styles.bookContent}>
              <Text style={styles.bookName}>{book.name}</Text>
              <Text style={styles.bookAbbreviation}>{book.abbreviation || book.id}</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        ))}
        
        {getFilteredBooks().length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {books.length === 0 
                ? 'No books loaded from API' 
                : `No ${selectedTestament === 'old' ? 'Old' : 'New'} Testament books found`
              }
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
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
  testamentSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#DDBBA1',
    borderRadius: 12,
    padding: 4,
  },
  testamentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTestamentButton: {
    backgroundColor: '#A07553',
  },
  testamentButtonText: {
    color: '#9E795D',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTestamentButtonText: {
    color: '#EEDED2',
  },
  booksContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bookItem: {
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
  bookContent: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bookAbbreviation: {
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

export default BooksListPage;