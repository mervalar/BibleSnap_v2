import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/profile';

export default function ProfileCard({ user }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileImageContainer}>
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileInitial}>{initial}</Text>
        </View>
        <View style={styles.statusIndicator} />
      </View>
      <Text style={styles.profileName}>{user?.name || 'User'}</Text>
      <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
      <View style={styles.joinedContainer}>
        <Ionicons name="calendar-outline" size={16} color="#5A4A33" />
        <Text style={styles.joinedText}>Member since March 2024</Text>
      </View>
    </View>
  );
}
