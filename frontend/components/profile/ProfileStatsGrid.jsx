import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileStatsGrid({ savedVersesCount, journalCount, studyPlanSummary }) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Ionicons name="bookmark" size={24} color={COLORS.primary} />
        <Text style={styles.statNumber}>{savedVersesCount}</Text>
        <Text style={styles.statLabel}>Verses Saved</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="journal" size={24} color={COLORS.semantic.info} />
        <Text style={styles.statNumber}>{journalCount}</Text>
        <Text style={styles.statLabel}>Journals</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="calendar" size={24} color={COLORS.primary} />
        <Text style={styles.statNumber}>
          {studyPlanSummary ? `${studyPlanSummary.percent}%` : '—'}
        </Text>
        <Text style={styles.statLabel}>Plan Progress</Text>
      </View>
    </View>
  );
}
