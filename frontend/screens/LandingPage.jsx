import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Add this import
import styles from './../styles/LandingPage.styles';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const LandingPage = ({navigation}) => {
  const [primaryButtonAnim] = useState(new Animated.Value(1));
  const [secondaryButtonAnim] = useState(new Animated.Value(1));

  const handlePrimaryPressIn = () => {
    Animated.spring(primaryButtonAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePrimaryPressOut = () => {
    Animated.spring(primaryButtonAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleSecondaryPressIn = () => {
    Animated.spring(secondaryButtonAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleSecondaryPressOut = () => {
    Animated.spring(secondaryButtonAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Gradient Header Background */}
      <LinearGradient
        colors={['#AE796D', '#A07553', '#8B7355']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <View style={styles.appIcon}>
            <Image
              source={require('../assets/Biblesnap.png')}
              style={{ width: 100, height: 100, borderRadius: 30 }}
              resizeMode="contain"
            />
          </View>
          
          {/* App Title */}
          <Text style={styles.appTitleOnGradient}>BibleSnap</Text>
          <Text style={styles.appSubtitleOnGradient}>Your Daily Scripture Companion</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentCard}>
        <Text style={styles.welcomeTitle}>Welcome to BibleSnap!</Text>
        <Text style={styles.welcomeText}>
          Your journey to deeper biblical understanding and spiritual growth starts here.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* Book Icon */}
              <View style={{ width: 20, height: 16, backgroundColor: 'white', borderRadius: 2 }}>
                <View style={{ width: '100%', height: 2, backgroundColor: '#AE796D', marginTop: 4 }} />
                <View style={{ width: '80%', height: 2, backgroundColor: '#AE796D', marginTop: 2 }} />
                <View style={{ width: '90%', height: 2, backgroundColor: '#AE796D', marginTop: 2 }} />
              </View>
            </View>
            <Text style={styles.featureTitle}>Bible Study</Text>
            <Text style={styles.featureDescription}>Read, listen, and explore Scripture daily</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* Prayer Hands Icon */}
              <View style={{ 
                width: 16, 
                height: 20, 
                backgroundColor: 'white', 
                borderRadius: 8,
                position: 'relative'
              }}>
                <View style={{
                  position: 'absolute',
                  top: 4,
                  left: 2,
                  width: 12,
                  height: 12,
                  backgroundColor: '#AE796D',
                  borderRadius: 6,
                }} />
              </View>
            </View>
            <Text style={styles.featureTitle}>Prayer Tools</Text>
            <Text style={styles.featureDescription}>Track prayers and set reminders</Text>
          </View>

          {/* Journal */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* Journal Icon */}
              <View style={{ 
                width: 18, 
                height: 20, 
                backgroundColor: 'white', 
                borderRadius: 2,
                borderLeftWidth: 3,
                borderLeftColor: '#AE796D'
              }}>
                <View style={{ width: '80%', height: 2, backgroundColor: '#AE796D', marginTop: 4, marginLeft: 2 }} />
                <View style={{ width: '60%', height: 2, backgroundColor: '#AE796D', marginTop: 2, marginLeft: 2 }} />
                <View style={{ width: '70%', height: 2, backgroundColor: '#AE796D', marginTop: 2, marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.featureTitle}>Journal</Text>
            <Text style={styles.featureDescription}>Document your spiritual journey</Text>
          </View>

          {/* AI Assistant */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* AI Icon */}
              <View style={{ 
                width: 20, 
                height: 20, 
                backgroundColor: 'white', 
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <View style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: '#AE796D',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <View style={{ 
                    width: 4, 
                    height: 4, 
                    backgroundColor: '#AE796D', 
                    borderRadius: 2 
                  }} />
                </View>
              </View>
            </View>
            <Text style={styles.featureTitle}>AI Assistant</Text>
            <Text style={styles.featureDescription}>Get instant biblical insights</Text>
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={{
                width: 20,
                height: 20,
                marginHorizontal: 2,
              }}>
                <View style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 8,
                  borderRightWidth: 8,
                  borderBottomWidth: 6,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: '#FFD700',
                  transform: [{ rotate: '35deg' }],
                  position: 'absolute',
                  top: 4,
                  left: 2,
                }} />
                <View style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 8,
                  borderRightWidth: 8,
                  borderBottomWidth: 6,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: '#FFD700',
                  transform: [{ rotate: '-35deg' }],
                  position: 'absolute',
                  top: 4,
                  left: 2,
                }} />
              </View>
            ))}
          </View>
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewAuthor}>Changed my daily routine!</Text>
            <Text style={styles.reviewText}>
              "This app has transformed how I connect with Scripture. The daily reminders and journal features keep me accountable."
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchableOpacity 
            style={[
              styles.primaryButton,
              { transform: [{ scale: primaryButtonAnim }] }
            ]}
            onPressIn={handlePrimaryPressIn}
            onPressOut={handlePrimaryPressOut}
            activeOpacity={1}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </AnimatedTouchableOpacity>
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