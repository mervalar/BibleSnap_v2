import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from '../../styles/bIbleStudyContent.styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const styles = createStyles();
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F8B500', '#FF69B4', '#32CD32', '#FF8C00'];

export default function CelebrationOverlay({ visible }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnims = useRef(
    Array.from({ length: 50 }, () => {
      const startX = Math.random() * screenWidth;
      const startY = -50 - Math.random() * 100;
      const endY = screenHeight + 100;
      const horizontalDrift = (Math.random() - 0.5) * 200;
      const initialRotation = Math.random() * 360;
      const finalRotation = initialRotation + 360 + Math.random() * 180;
      return {
        translateY: new Animated.Value(startY),
        translateX: new Animated.Value(0),
        rotate: new Animated.Value(initialRotation),
        scale: new Animated.Value(0),
        startX, startY, endY, horizontalDrift, initialRotation, finalRotation,
      };
    })
  ).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true }),
      ]).start();
      confettiAnims.forEach((anim, index) => {
        anim.translateY.setValue(anim.startY);
        anim.translateX.setValue(0);
        anim.scale.setValue(0);
        const delay = index * 20;
        const duration = 2000 + Math.random() * 1000;
        Animated.parallel([
          Animated.timing(anim.translateY, { toValue: anim.endY, duration, delay, useNativeDriver: true }),
          Animated.timing(anim.translateX, { toValue: anim.horizontalDrift, duration, delay, useNativeDriver: true }),
          Animated.timing(anim.rotate, { toValue: anim.finalRotation, duration, delay, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(anim.scale, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 0.8, duration: duration - 600, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]).start();
      });
      setTimeout(() => Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(), 2500);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(anim.startY);
        anim.translateX.setValue(0);
        anim.scale.setValue(0);
        anim.rotate.setValue(anim.initialRotation);
      });
    }
  }, [visible, fadeAnim, scaleAnim, confettiAnims]);

  if (!visible) return null;
  return (
    <View style={styles.celebrationOverlay} pointerEvents="none">
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiBubble,
            {
              backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              width: 12 + Math.random() * 16,
              height: 12 + Math.random() * 16,
              borderRadius: 14,
              left: anim.startX,
              top: anim.startY,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { rotate: anim.rotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
                { scale: anim.scale },
              ],
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.celebrationMessage, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.celebrationIconCircle}>
          <Ionicons name="checkmark-circle" size={48} color="#4A7742" />
        </View>
        <Text style={styles.celebrationText}>Completed! 🎉</Text>
      </Animated.View>
    </View>
  );
}
