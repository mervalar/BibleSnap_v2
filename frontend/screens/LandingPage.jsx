import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,Image } from 'react-native';
import styles from './../styles/LandingPage.styles'; 

const LandingPage = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.appIcon}>
        <Image
          source={require('../assets/Biblesnap.png')}
          style={{ width: 100, height: 100, borderRadius: 30 }}
          resizeMode="contain"
        />
       </View>
        
        {/* App Title */}
        <Text style={styles.appTitle}>BibleSnap</Text>
        <Text style={styles.appSubtitle}>Your Daily Scripture Companion</Text>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.welcomeTitle}>Welcome to BibleSnap!</Text>
        <Text style={styles.welcomeText}>
          Your journey to deeper biblical understanding and spiritual growth starts here.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
            </View>
            <Text style={styles.featureTitle}>Bible Study</Text>
            <Text style={styles.featureDescription}>Read, listen, and explore Scripture daily</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <DollarSign className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>Prayer Tools</Text>
            <Text style={styles.featureDescription}>Track prayers and set reminders</Text>
          </View>

          {/* Journal */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <Edit3 className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>Journal</Text>
            <Text style={styles.featureDescription}>Document your spiritual journey</Text>
          </View>

          {/* AI Assistant */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <Crown className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>AI Assistant</Text>
            <Text style={styles.featureDescription}>Get instant biblical insights</Text>
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          {/* <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </View> */}
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewAuthor}>Changed my daily routine!</Text>
            <Text style={styles.reviewText}>
              "This app has transformed how I connect with Scripture. The daily reminders and journal features keep me accountable."
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms */}
      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> &{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>
    </ScrollView>
  );
};

export default LandingPage;