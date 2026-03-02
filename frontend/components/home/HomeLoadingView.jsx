import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styles from '../../styles/HomePage.styles';
import { COLORS } from '../../styles/theme';

export default function HomeLoadingView() {
  return (
    <View style={[styles.container, styles.loadingContainer]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}
