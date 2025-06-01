import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this import
import styles from './../styles/HomePage.styles'; 

const HomePage = () => {
  const navigation = useNavigation(); // Add this line

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>BibleSnap</Text>
          <Text style={styles.greeting}>Good morning, Sarah</Text>
        </View>
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileInitial}>S</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5/7</Text>
          <Text style={styles.statLabel}>Daily Goal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12 Days</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Chapters</Text>
        </View>
      </View>

      {/* Verse of the Day */}
      <View style={styles.verseCard}>
        <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
        <Text style={styles.verseText}>
          "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."
        </Text>
        <Text style={styles.verseRef}>Jeremiah 29:11</Text>
        <View style={styles.verseActions}>
          <Text style={styles.verseAction}>♡</Text>
          <Text style={styles.verseAction}>⤴</Text>
          <Text style={styles.verseAction}>📖</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('BookContent')}
        >
          <Text style={styles.quickActionText}>Pray</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.quickActionText}>Read</Text>
        </TouchableOpacity>
        <View style={styles.quickActionItem}>
          <Text style={styles.quickActionText}>Listen</Text>
        </View>
      </View>

      {/* Today's Challenge */}
      <Text style={styles.sectionTitle}>Today's Challenge</Text>
      <TouchableOpacity style={styles.challengeCard}>
        <Text style={styles.challengeTitle}>Meditate on Psalm 23</Text>
        <Text style={styles.challengeDesc}>Take 5 minutes to reflect</Text>
      </TouchableOpacity>

      {/* AI Bible Assistant */}
      <TouchableOpacity style={styles.aiCard}>
        <Text style={styles.aiTitle}>AI Bible Assistant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};



export default HomePage;