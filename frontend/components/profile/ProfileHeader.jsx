import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileHeader({ onBack, onEdit }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={24} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );
}
