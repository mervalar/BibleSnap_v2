import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const BibleStudyApp = ({ navigation }) => {
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
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>Topical</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>Character</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>Book Study</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inactiveFilter}>
            <Text style={styles.inactiveFilterText}>Devotional</Text>
          </TouchableOpacity>
        </View>

        {/* In Progress Studies Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>In Progress</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("BibleStudyContent")}
          >
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* In Progress Bible Study Entries */}
        <View style={styles.entriesContainer}>
          {/* Topical Study */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>📚</Text>
                <Text style={styles.categoryText}>Topical</Text>
              </View>
              <Text style={styles.entryDate}>June 05, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Faith in Times of Trouble</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Hebrews 11:1</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>3/5 lessons</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: '60%'}]} />
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

          {/* Character Study */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>👤</Text>
                <Text style={styles.categoryText}>Character</Text>
              </View>
              <Text style={styles.entryDate}>June 03, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>The Life of David</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>1 Samuel 16:7</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>7/10 lessons</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: '70%'}]} />
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

          {/* Book Study */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>📜</Text>
                <Text style={styles.categoryText}>Book Study</Text>
              </View>
              <Text style={styles.entryDate}>June 01, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Philippians: Joy in Christ</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Philippians 4:4</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>2/4 chapters</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: '50%'}]} />
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

          {/* Devotional Study */}
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>💝</Text>
                <Text style={styles.categoryText}>Devotional</Text>
              </View>
              <Text style={styles.entryDate}>May 30, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Daily Bread: God's Provision</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Matthew 6:11</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>15/21 days</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: '71%'}]} />
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

        {/* Recent & Completed Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent & Completed</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent & Completed Studies */}
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

          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryIcon}>👤</Text>
                <Text style={styles.categoryText}>Character</Text>
              </View>
              <Text style={styles.entryDate}>May 25, 2025</Text>
            </View>
            
            <Text style={styles.entryTitle}>Women of Faith</Text>
            
            <View style={styles.entryFooter}>
              <View style={styles.verseContainer}>
                <Text style={styles.verseIcon}>📖</Text>
                <Text style={styles.verseText}>Proverbs 31:25</Text>
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