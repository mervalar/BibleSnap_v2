import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish, duration = 6500 }) => { // Increased from 4500 to 6500 (added 2 seconds)
  const [showSplash, setShowSplash] = useState(true);
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const quoteTranslateY = useRef(new Animated.Value(50)).current;
  const authorOpacity = useRef(new Animated.Value(0)).current;
  const backgroundGradient = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    const animationSequence = Animated.sequence([
      // Background gradient fade in
      Animated.timing(backgroundGradient, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      
      // Logo entrance - scale and fade in simultaneously
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      
      // Quote entrance with slide up effect
      Animated.parallel([
        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(quoteTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold quote for a moment
      Animated.delay(1500),
      
      // Quick fade out of quote (added this)
      Animated.timing(quoteOpacity, {
        toValue: 0,
        duration: 400, // Quick fade out in 400ms
        useNativeDriver: true,
      }),
      
      // Author name fade in (if you want to keep this)
      Animated.timing(authorOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();

    // Hide splash screen after total duration
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  if (!showSplash) {
    return null;
  }

  const backgroundColorInterpolation = backgroundGradient.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F5F0EB', '#E8DDD4'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: backgroundColorInterpolation }
      ]}
    >
      <StatusBar hidden={true} />
      
      {/* Logo with animations */}
      <Animated.Image
        source={require('../assets/Biblesnap.png')} 
        style={[
          styles.logo,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
        resizeMode="contain"
      />
      
      {/* Quote Section */}
      <View style={styles.quoteContainer}>
        <Animated.Text 
          style={[
            styles.quote,
            {
              opacity: quoteOpacity,
              transform: [{ translateY: quoteTranslateY }],
            },
          ]}
        > 
          "Walking daily with GOD."
        </Animated.Text>
        
      </View>
      
      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.decorativeLine} />
        <View style={styles.decorativeDot} />
        <View style={styles.decorativeLine} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
    paddingHorizontal: 30,
  },
  logo: {
    width: width * 0.6, 
    height: height * 0.25, 
    maxWidth: 250,
    maxHeight: 250,
    marginBottom: 40,
  },
  quoteContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  quote: {
    fontSize: 22,
    fontWeight: '300',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: 20,
    maxWidth: width * 0.85,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513', 
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 10,
  },
  decorativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    opacity: 0.6,
  },
  decorativeLine: {
    width: 40,
    height: 1,
    backgroundColor: '#8B4513', 
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B4513', 
    marginHorizontal: 15,
  },
});

export default SplashScreen;