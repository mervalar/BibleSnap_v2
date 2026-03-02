import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileLoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.text.light} />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  );
}
