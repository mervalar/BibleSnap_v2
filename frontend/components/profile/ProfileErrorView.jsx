import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileErrorView({ onGoBack }) {
  return (
    <View style={styles.loadingContainer}>
      <Ionicons name="person-outline" size={64} color={COLORS.text.light} />
      <Text style={styles.errorTitle}>No Profile Found</Text>
      <Text style={styles.errorText}>Unable to load your profile data.</Text>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
