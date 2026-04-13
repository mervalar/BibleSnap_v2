import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/LandingPage.styles';

const FEATURES = [
  { icon: 'book-outline', title: 'Read the Bible', description: 'Explore books, chapters, and highlights in a clean reader.' },
  { icon: 'calendar-outline', title: 'Study plans', description: 'Follow a plan that fits your pace and stay on track.' },
  { icon: 'create-outline', title: 'Journal', description: 'Reflect on verses and capture what God is teaching you.' },
  { icon: 'heart-outline', title: 'Daily verse', description: 'Start each day with scripture and share encouragement.' },
];

export default function LandingPage() {
  const navigation = useNavigation();

  const openTerms = () => Linking.openURL('https://biblesnap.bellatis.com/terms').catch(() => {});

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        <LinearGradient
          colors={['#AE796D', '#8B5A4E', '#7A4C42']}
          style={styles.gradientHeader}
        >
          <View style={styles.header}>
            <View style={[styles.appIcon, { marginBottom: 16 }]}>
              <Ionicons name="book" size={48} color="#AE796D" />
            </View>
            <Text style={styles.appTitleOnGradient}>BibleSnap</Text>
            <Text style={styles.appSubtitleOnGradient}>Your daily Bible companion</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentCard}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeText}>
            Read, study, and journal in one place. Build a habit that nourishes your faith.
          </Text>

          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={f.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDescription}>{f.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.reviewSection}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={20} color="#C9A227" style={{ marginHorizontal: 2 }} />
              ))}
            </View>
            <View style={styles.reviewTextContainer}>
              <Text style={styles.reviewAuthor}>Loved by readers</Text>
              <Text style={styles.reviewText}>
                A simple way to stay in the Word every day—whether you have five minutes or an hour.
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.primaryButtonText}>Get started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AuthScreen')}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText} onPress={openTerms}>
            Terms
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
