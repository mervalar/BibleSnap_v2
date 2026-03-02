import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function EncouragementBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <View
      style={[
        styles.encouragementBanner,
        message.type === 'sad' && styles.encouragementBannerSad,
        message.type === 'happy' && styles.encouragementBannerHappy,
      ]}
    >
      <Text style={styles.encouragementEmoji}>{message.emoji}</Text>
      <Text style={styles.encouragementText}>{message.text}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.encouragementClose}>
        <Ionicons name="close" size={20} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );
}
