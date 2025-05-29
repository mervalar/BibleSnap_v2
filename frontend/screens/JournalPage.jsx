import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const JournalApp = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <TouchableOpacity style={styles.searchIcon}>
          <Text style={styles.searchText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This month</Text>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statText}>Entries</Text>
            <View style={styles.editIcon}>
              <Text>✏️</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Favorite verse</Text>
            <Text style={styles.verseText}>📖 Psalm 23:1</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>All Entries</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>❤️ Gratitude</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>🙏 Prayer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>💡</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Journal Entries */}
        <View style={styles.entriesContainer}>
          {/* Today Entry */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryDate}>Today</Text>
                <Text style={styles.entryTitle}>Morning Reflection</Text>
              </View>
              <View style={styles.bookmark}>
                <Text style={styles.bookmarkIcon}>🔖</Text>
              </View>
            </View>
            
            <Text style={styles.entryContent}>
              Today I meditated on Psalm 23. The phrase "He restores my soul" spoke to me as I've been feeling overwhelmed lately...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Prayer</Text>
                </View>
                <View style={styles.insightTag}>
                  <Text style={styles.insightTagText}>Insight</Text>
                </View>
              </View>
              <Text style={styles.entryTime}>9:15 AM</Text>
            </View>
          </View>

          {/* Yesterday Entry */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryDate}>Yesterday</Text>
                <Text style={styles.entryTitle}>Evening Thanks</Text>
              </View>
            </View>
            
            <Text style={styles.entryContent}>
              I'm thankful for the peace I found in today's reading. John 14:27 reminded me...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.tagContainer}>
                <View style={styles.gratitudeTag}>
                  <Text style={styles.gratitudeTagText}>Gratitude</Text>
                </View>
              </View>
              <Text style={styles.entryTime}>10:32 PM</Text>
            </View>
          </View>

          {/* May 12 Entry */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryDate}>May 12, 2023</Text>
                <Text style={styles.entryTitle}>Breakthrough Moment</Text>
              </View>
            </View>
            
            <Text style={styles.entryContent}>
              Today's sermon on Romans 8:28 helped me understand how God works all things...
            </Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.tagContainer}>
                <View style={styles.insightTag}>
                  <Text style={styles.insightTagText}>Insight</Text>
                </View>
              </View>
              <Text style={styles.entryTime}>4:15 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchIcon: {
    padding: 5,
  },
  searchText: {
    fontSize: 20,
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flex: 0.48,
    position: 'relative',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  verseText: {
    fontSize: 16,
    color: '#A07553',
    fontWeight: '600',
    marginTop: 10,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  activeFilter: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveFilter: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  inactiveFilterText: {
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#A07553',
    borderRadius: 2,
    width: '60%',
  },
  entriesContainer: {
    paddingBottom: 100,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#AE796D',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 14,
    color: '#A07553',
    fontWeight: '500',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  bookmark: {
    padding: 5,
  },
  bookmarkIcon: {
    fontSize: 16,
    color: '#AE796D',
  },
  entryContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  insightTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  insightTagText: {
    fontSize: 12,
    color: '#F57C00',
  },
  gratitudeTag: {
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  gratitudeTagText: {
    fontSize: 12,
    color: '#C2185B',
  },
  entryTime: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#AE796D',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});
export default JournalApp;