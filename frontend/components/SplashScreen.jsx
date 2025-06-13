import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish, duration = 3000 }) => {
  const [showSplash, setShowSplash] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    // Start the zoom animation immediately
    Animated.timing(scaleAnim, {
      toValue: 1, // Scale to full size
      duration: 2000, // 2 seconds
      useNativeDriver: true,
    }).start();

    // Hide splash screen after total duration
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish, scaleAnim]);

  if (!showSplash) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Animated.Image
        source={require('../assets/Biblesnap.png')} 
        style={[
          styles.logo,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  logo: {
    width: width * 0.8, 
    height: height * 0.4, 
    maxWidth: 300,
    maxHeight: 300,
  },
});

export default SplashScreen;