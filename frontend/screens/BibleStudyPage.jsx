import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import styles from './../styles/BibleStudy.styles'; 

const BibleStudy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Prayer</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.circleProgress}>
                <Text style={styles.percentageText}>75%</Text>
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsSubtitle}>This week</Text>
                <Text style={styles.statsTitle}>15</Text>
                <Text style={styles.statsTitle}>Prayers</Text>
              </View>
            </View>
            
            <View style={styles.answeredCard}>
              <Text style={styles.heartIcon}>♡</Text>
              <Text style={styles.answeredSubtitle}>Answered</Text>
              <Text style={styles.answeredTitle}>3 This</Text>
              <Text style={styles.answeredTitle}>Month</Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesContainer}>
            <View style={styles.categoryItem}>
              <View style={[styles.categoryIcon, styles.familyIcon]}>
                <Text style={styles.categoryIconText}>👥</Text>
              </View>
              <Text style={styles.categoryText}>Family</Text>
            </View>
            
            <View style={styles.categoryItem}>
              <View style={[styles.categoryIcon, styles.healthIcon]}>
                <Text style={styles.categoryIconText}>💚</Text>
              </View>
              <Text style={styles.categoryText}>Health</Text>
            </View>
            
            <View style={styles.categoryItem}>
              <View style={[styles.categoryIcon, styles.guidanceIcon]}>
                <Text style={styles.categoryIconText}>🙏</Text>
              </View>
              <Text style={styles.categoryText}>Guidance</Text>
            </View>
            
            <View style={styles.categoryItem}>
              <View style={[styles.categoryIcon, styles.moreIcon]}>
                <Text style={styles.categoryIconText}>+</Text>
              </View>
              <Text style={styles.categoryText}>More</Text>
            </View>
          </View>
        </View>

        {/* Guided Prayers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guided Prayers</Text>
            <TouchableOpacity>
              <Text style={styles.browseText}>Browse</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.guidedPrayerCard}>
            <View style={styles.guidedPrayerContent}>
              <Text style={styles.guidedPrayerDuration}>5 MINUTES</Text>
              <Text style={styles.guidedPrayerTitle}>Morning Prayer</Text>
              <Text style={styles.guidedPrayerSubtitle}>Start your day with gratitude and purpose</Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.guidedPrayerCardSecondary}>
            <View style={styles.guidedPrayerContent}>
              <Text style={styles.guidedPrayerDuration}>3 MINUTES</Text>
              <Text style={styles.guidedPrayerTitle}>Prayer for Peace</Text>
              <Text style={styles.guidedPrayerSubtitle}>Find calm in the midst of chaos</Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Prayers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Recent Prayers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recentPrayerItem}>
            <View style={styles.recentPrayerIcon}>
              <Text style={styles.recentPrayerIconText}>🙏</Text>
            </View>
            <View style={styles.recentPrayerContent}>
              <Text style={styles.recentPrayerTitle}>For Mom's Health</Text>
              <Text style={styles.recentPrayerDate}>Added 2 days ago</Text>
            </View>
            <View style={styles.recentPrayerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.recentPrayerItem}>
            <View style={styles.recentPrayerIcon}>
              <Text style={styles.recentPrayerIconText}>🙏</Text>
            </View>
            <View style={styles.recentPrayerContent}>
              <Text style={styles.recentPrayerTitle}>New Job Opportunity</Text>
              <Text style={styles.recentPrayerDate}>Added 5 days ago</Text>
            </View>
            <View style={styles.recentPrayerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navText}>Bible</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navIcon}>🙏</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Prayer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};



export default BibleStudy;