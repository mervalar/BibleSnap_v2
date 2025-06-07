import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList
} from 'react-native';
import { fetchCategories } from '../api/categoryService';
import { fetchStarks } from '../api/starksService';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BibleStudyApp = ({ navigation }) => {

  const [categories, setCategories] = useState([]);
  const [starks, setStarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [progressMap, setProgressMap] = useState({}); 
  const [openedStarks, setOpenedStarks] = useState([]); // Track opened starks

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadStarks = async () => {
      const fetchedStarks = await fetchStarks();
      setStarks(fetchedStarks);
    };
    loadStarks();
  }, []);

  // Load progress from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('bibleProgress').then(data => {
      if (data) setProgressMap(JSON.parse(data));
    });
  }, []);

  // Save progress to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
  }, [progressMap]);

  // Load opened starks from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('openedStarks').then(data => {
      if (data) setOpenedStarks(JSON.parse(data));
    });
  }, []);

  // Save opened starks to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('openedStarks', JSON.stringify(openedStarks));
  }, [openedStarks]);

  const filteredStarks =
    selectedCategory === 'all'
      ? starks
      : starks.filter(
          (item) => item.category && item.category.id === selectedCategory
        );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bible Studies</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 20, marginLeft: 4 }}
          contentContainerStyle={{ alignItems: 'center', gap: 12 }}
        >
          <TouchableOpacity
            style={
              selectedCategory === 'all'
                ? styles.activeFilter
                : styles.inactiveFilter
            }
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={
                selectedCategory === 'all'
                  ? styles.activeFilterText
                  : styles.inactiveFilterText
              }
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={
                selectedCategory === item.id
                  ? styles.activeFilter
                  : styles.inactiveFilter
              }
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={
                  selectedCategory === item.id
                    ? styles.activeFilterText
                    : styles.inactiveFilterText
                }
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* In Progress Studies Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bible study</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* In Progress Bible Study Entries */}
        <View style={styles.entriesContainer}>
          {filteredStarks.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.entryCard}
              onPress={() => {
                if (!openedStarks.includes(item.id)) {
                  setOpenedStarks(prev => [...prev, item.id]);
                }
                navigation.navigate('BibleStudyContent', {
                  stark: item,
                  onProgressUpdate: (percent) => {
                    setProgressMap((prev) => ({ ...prev, [item.id]: percent }));
                  }
                });
              }}
            >
              <View style={styles.entryHeader}>
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryIcon}>📚</Text>
                  <Text style={styles.categoryText}>{item.category?.name || 'Topical'}</Text>
                </View>
                <Text style={styles.entryDate}>{item.date || 'Unknown date'}</Text>
              </View>
              <Text style={styles.entryTitle}>{item.title}</Text>
              <View style={styles.entryFooter}>
                <View style={styles.verseContainer}>
                  <Text style={styles.verseIcon}>📖</Text>
                  <Text style={styles.verseText}>{item.main_verse || 'Verse'}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {item.progressText || '0/0 lessons'}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: item.progressPercent || '0%' },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Studies Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>
        <View style={styles.entriesContainer}>
          {starks
            .filter(item => openedStarks.includes(item.id))
            .slice(-3) // show last 3 opened
            .reverse() // most recent first
            .map((item) => (
              <View key={item.id} style={styles.entryCard}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressMap[item.id] || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progressMap[item.id] ? `${progressMap[item.id]}%` : '0%'}
                </Text>
              </View>
            ))}
        </View>

        {/* Completed Studies */}
        <View style={styles.entriesContainer}>
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>📚</Text>
                <Text style={styles.categoryText}>Topical</Text>
              </View>
              <Text style={styles.entryDate}>May 28, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Prayer and Fasting</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Matthew 17:21</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Completed</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#AE796D',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: '#AE796D',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 4,
    gap: 12,
    flexWrap: 'wrap',
  },
  activeFilter: {
    backgroundColor: '#AE796D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveFilter: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  inactiveFilterText: {
    color: '#A07553',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    color: '#AE796D',
    fontSize: 14,
    fontWeight: '500',
  },
  entriesContainer: {
    marginBottom: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#AE796D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A07553',
  },
  entryDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '400',
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    lineHeight: 18,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AE796D',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verseIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  verseText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    width: 50,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#AE796D',
    borderRadius: 2,
  },
  completedBadge: {
    width: 16,
    height: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#A07553',
  },
});

export default BibleStudyApp;