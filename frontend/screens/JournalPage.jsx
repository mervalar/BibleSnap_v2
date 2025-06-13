import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import UserNoteModal from '../components/JournalModal'; 
import { fetchNoteCategories } from '../api/noteCategories';

const JournalApp = () => {
    const [modalVisible, setModalVisible] = useState(false);
      const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

    const handleSaveNote = (noteData) => {
    setModalVisible(false);
  };

  useEffect(() => {
    const getCategories = async () => {
      const data=await fetchNoteCategories();
      setCategories(data);
    };
    getCategories();
  }, []);



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <TouchableOpacity
          style={activeCategory === 'All' ? styles.activeFilter : styles.inactiveFilter}
          onPress={() => setActiveCategory('All')}
        >
          <Text style={activeCategory === 'All' ? styles.activeFilterText : styles.inactiveFilterText}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id || cat.name}
            style={activeCategory === cat.name ? styles.activeFilter : styles.inactiveFilter}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text style={activeCategory === cat.name ? styles.activeFilterText : styles.inactiveFilterText}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

        {/* Journal Entries */}
        <View style={styles.entriesContainer}>
          {/* Gratitude Entry */}
          <View style={[styles.entryCard, styles.gratitudeCard]}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>💝</Text>
                <Text style={styles.categoryText}>Gratitude</Text>
              </View>
              <Text style={styles.entryDate}>May 28, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Thankful for today's answered prayer!</Text>
            <Text style={styles.entryContent}>
              This morning, God reminded me of his faithfulness in...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Psalms 118:24</Text>
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

          {/* Prayer Entry */}
          <View style={[styles.entryCard, styles.prayerCard]}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>🙏</Text>
                <Text style={styles.categoryText}>Prayer</Text>
              </View>
              <Text style={styles.entryDate}>May 27, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Praying for wisdom at work</Text>
            <Text style={styles.entryContent}>
              Asked God for guidance during a tough meeting, and...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>James 1:5</Text>
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

          {/* Reflection Entry */}
          <View style={[styles.entryCard, styles.reflectionCard]}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>💭</Text>
                <Text style={styles.categoryText}>Reflection</Text>
              </View>
              <Text style={styles.entryDate}>May 26, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Learning to trust in hard times</Text>
            <Text style={styles.entryContent}>
              Difficulties are opportunities to grow stronger in faith...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Romans 5:3</Text>
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

          {/* Discovery Entry */}
          <View style={[styles.entryCard, styles.discoveryCard]}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>💡</Text>
                <Text style={styles.categoryText}>Discovery</Text>
              </View>
              <Text style={styles.entryDate}>May 25, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>New insight from Genesis</Text>
            <Text style={styles.entryContent}>
              Saw how God's promises never fail, even when it see...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Genesis 21:1</Text>
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
      <UserNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveNote}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  },
  activeFilter: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveFilter: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  inactiveFilterText: {
    color: '#A07553',
    fontSize: 14,
    fontWeight: '500',
  },
  entriesContainer: {
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gratitudeCard: {
    borderLeftColor: '#E91E63',
    backgroundColor: '#FDEDF2',
  },
  prayerCard: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#F0F8FF',
  },
  reflectionCard: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  discoveryCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A07553',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  entryContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AE796D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verseIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  verseText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#A07553',
  },
});

export default JournalApp;