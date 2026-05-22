import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, COLORS } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function EncouragementBanner({ message, onDismiss }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 90, friction: 14, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [message]);

  return (
    <Animated.View
      pointerEvents={message ? 'auto' : 'none'}
      style={[
        styles.encouragementBanner,
        message?.type === 'sad' && styles.encouragementBannerSad,
        message?.type === 'happy' && styles.encouragementBannerHappy,
        {
          top: insets.top + 68,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.encouragementEmoji}>{message?.emoji ?? ''}</Text>
      <Text style={styles.encouragementText}>{message?.text ?? ''}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.encouragementClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
}
