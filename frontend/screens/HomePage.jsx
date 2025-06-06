import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
  const navigation = useNavigation();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://beta.ourmanna.com/api/v1/get?format=json')
      .then(res => res.json())
      .then(data => {
        setVerse(data.verse.details);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>S</Text>
          </View>
          <Text style={styles.greeting}>Hello, Sarah</Text>
        </View>
        <TouchableOpacity style={styles.bellIcon}>
          <Text style={styles.bellText}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Verse of the Day Card */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
          {loading ? (
            <ActivityIndicator color="#A07553" />
          ) : verse ? (
            <>
              <Text style={styles.verseText}>
                "{verse.text}"
              </Text>
              <Text style={styles.verseRef}>{verse.reference}</Text>
            </>
          ) : (
            <Text style={styles.verseText}>Could not load verse.</Text>
          )}
          
          <View style={styles.verseActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>♡</Text>
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionText}>Read Chapter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={[styles.quickActionCard, styles.prayerCard]}
            onPress={() => navigation.navigate('BibleStudy')}
          >
            <Text style={styles.quickActionIcon}>🔥</Text>
            <Text style={styles.quickActionTitle}>Daily Prayer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, styles.studyCard]}
            onPress={() => navigation.navigate('BooksList')}
          >
            <Text style={styles.quickActionIcon}>📚</Text>
            <Text style={styles.quickActionTitle}>Bible Study</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, styles.assistantCard]}
           onPress={() => navigation.navigate('Journal')}
           >
            <Text style={styles.quickActionIcon}>👑</Text>
            <Text style={styles.quickActionTitle}>AI Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Spiritual Growth Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Your Spiritual Growth</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              <View style={styles.chartLine}>
                <View style={[styles.chartPoint, {left: '10%', bottom: '30%'}]} />
                <View style={[styles.chartPoint, {left: '25%', bottom: '45%'}]} />
                <View style={[styles.chartPoint, {left: '40%', bottom: '35%'}]} />
                <View style={[styles.chartPoint, {left: '55%', bottom: '50%'}]} />
                <View style={[styles.chartPoint, {left: '70%', bottom: '45%'}]} />
                <View style={[styles.chartPoint, {left: '85%', bottom: '60%'}]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Mon</Text>
                <Text style={styles.chartLabel}>Tue</Text>
                <Text style={styles.chartLabel}>Wed</Text>
                <Text style={styles.chartLabel}>Thu</Text>
                <Text style={styles.chartLabel}>Fri</Text>
                <Text style={styles.chartLabel}>Sat</Text>
                <Text style={styles.chartLabel}>Sun</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Challenge */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Today's Challenge</Text>
          <Text style={styles.challengeDesc}>Share God's love with someone today</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>75%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEDED2',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20, // Added bottom padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    backgroundColor: '#A07553',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  bellIcon: {
    padding: 6,
  },
  bellText: {
    fontSize: 18,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  verseCard: {
    backgroundColor: '#DDBBA1',
    borderRadius: 16,
    padding: 20,
    flex: 0.3,
  },
  verseLabel: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  verseText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
    flex: 1,
  },
  verseRef: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 12,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  actionText: {
    color: '#9E795D',
    fontWeight: '600',
    fontSize: 11,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flex: 0.15,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerCard: {
    backgroundColor: '#DDBBA1',
  },
  studyCard: {
    backgroundColor: '#A07553',
  },
  assistantCard: {
    backgroundColor: '#9E795D',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionTitle: {
    color: '#EEDED2',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 0.25,
  },
  chartTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
  },
  chartContainer: {
    flex: 1,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#A07553',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  chartLabel: {
    color: '#9E795D',
    fontSize: 10,
  },
  challengeCard: {
    backgroundColor: '#DDBBA1',
    borderRadius: 16,
    padding: 16,
    flex: 0.12,
  },
  challengeTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  challengeDesc: {
    color: '#9E795D',
    fontSize: 12,
    marginBottom: 20,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#EEDED2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '75%',
    backgroundColor: '#A07553',
    borderRadius: 3,
  },
  progressText: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HomePage;