import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { createStyles, COLORS } from '../../styles/SavedVersesPage.styles';

const styles = createStyles();

const HIGHLIGHT_COLORS = [
  'rgba(255, 235, 59, 0.5)',
  'rgba(129, 212, 250, 0.5)',
  'rgba(186, 255, 201, 0.5)',
  'rgba(255, 183, 197, 0.5)',
  'rgba(255, 213, 128, 0.5)',
];

function extractChapterFromVerseId(verseId) {
  try {
    const parts = verseId.split('.');
    if (parts.length >= 2) return parts[1];
    const refMatch = verseId.match(/(\d+):/);
    if (refMatch) return refMatch[1];
  } catch (e) {}
  return '1';
}

const EmptyList = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No saved verses yet</Text>
    <Text style={styles.emptySubtext}>Highlight verses while reading to save them here</Text>
  </View>
);

const SavedVersesScreen = () => {
  const navigation = useNavigation();
  const [savedVerses, setSavedVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupByBook, setGroupByBook] = useState(true);
  const [colorFilter, setColorFilter] = useState(null);

  const loadSavedVerses = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      const highlightKeys = keys.filter((k) => k.startsWith('highlights_'));
      const highlightsData = await Promise.all(
        highlightKeys.map(async (key) => {
          try {
            const bookId = key.replace('highlights_', '');
            const bookData = await AsyncStorage.getItem(key);
            if (!bookData) return [];
            const parsed = JSON.parse(bookData);
            if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) return [];
            let bookName = bookId;
            try {
              const info = await AsyncStorage.getItem(`book_info_${bookId}`);
              if (info) bookName = JSON.parse(info).name || bookId;
            } catch (e) {}
            return Object.entries(parsed).map(([verseId, verseData]) => ({
              id: verseId,
              bookId,
              bookName,
              text: verseData?.text || '',
              color: verseData?.color || HIGHLIGHT_COLORS[0],
              reference: verseData?.reference || 'Unknown reference',
            }));
          } catch (e) {
            return [];
          }
        })
      );
      const all = highlightsData.flat();
      setSavedVerses(colorFilter ? all.filter((v) => v.color === colorFilter) : all);
    } catch (error) {
      console.error('Error loading saved verses', error);
      Alert.alert('Error', 'Failed to load your saved verses');
    } finally {
      setLoading(false);
    }
  }, [colorFilter]);

  useFocusEffect(useCallback(() => { loadSavedVerses(); }, [loadSavedVerses]));

  const handleDeleteVerse = async (verse) => {
    try {
      const key = `highlights_${verse.bookId}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return;
      const highlights = JSON.parse(data);
      delete highlights[verse.id];
      await AsyncStorage.setItem(key, JSON.stringify(highlights));
      setSavedVerses((prev) => prev.filter((v) => v.id !== verse.id));
      Alert.alert('Success', 'Verse removed from saved verses');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the verse');
    }
  };

  const navigateToVerse = (verse) => {
    const chapter = extractChapterFromVerseId(verse.id);
    navigation.navigate('BookContent', {
      book: { id: verse.bookId, name: verse.bookName },
      verseId: verse.id,
      chapter: { number: chapter },
    });
  };

  const filtered = colorFilter ? savedVerses.filter((v) => v.color === colorFilter) : savedVerses;
  const bookGroups = filtered.reduce((acc, verse) => {
    if (!acc[verse.bookId]) acc[verse.bookId] = { bookId: verse.bookId, bookName: verse.bookName, verses: [] };
    acc[verse.bookId].verses.push(verse);
    return acc;
  }, {});

  const renderVerseItem = (verse) => (
    <TouchableOpacity
      style={[styles.verseCard, { backgroundColor: verse.color + '30' }]}
      onPress={() => navigateToVerse(verse)}
    >
      <View style={styles.verseHeader}>
        <Text style={styles.verseReference}>{verse.bookName} {verse.reference}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVerse(verse)}>
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
      <Video source={require('../../assets/view.mp4')} style={styles.backgroundVideo} shouldPlay isLooping isMuted resizeMode="cover" />
      <SafeAreaView style={styles.contentOverlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Verses</Text>
          <TouchableOpacity style={styles.groupButton} onPress={() => setGroupByBook((b) => !b)}>
            <Ionicons name={groupByBook ? 'list' : 'albums'} size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Saved Verses ({filtered.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, !colorFilter ? styles.filterChipActive : styles.filterChipInactive]}
              onPress={() => setColorFilter(null)}
            >
              <Text style={!colorFilter ? styles.filterChipTextActive : styles.filterChipText}>All Colors</Text>
            </TouchableOpacity>
            {HIGHLIGHT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.filterChip, { backgroundColor: colorFilter === color ? COLORS.primary : color, borderWidth: colorFilter === color ? 2 : 0, borderColor: COLORS.primary }]}
                onPress={() => setColorFilter(colorFilter === color ? null : color)}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, borderWidth: 1, borderColor: '#ccc' }} />
              </TouchableOpacity>
            ))}
            {colorFilter && (
              <TouchableOpacity style={[styles.filterChip, styles.filterChipInactive]} onPress={() => setColorFilter(null)}>
                <Text style={styles.filterChipText}>Reset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your saved verses...</Text>
          </View>
        ) : groupByBook ? (
          <FlatList
            data={Object.values(bookGroups)}
            keyExtractor={(item) => item.bookId}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.bookSection}>
                <Text style={styles.bookHeader}>{item.bookName}</Text>
                {item.verses.map((v) => <View key={v.id}>{renderVerseItem(v)}</View>)}
              </View>
            )}
            ListEmptyComponent={<EmptyList />}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => renderVerseItem(item)}
            ListEmptyComponent={<EmptyList />}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default SavedVersesScreen;
