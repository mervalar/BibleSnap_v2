import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function BibleStudyFilterBar({ selectedType, onTypePress, studyPlan, onPlanPress }) {
  return (
    <View style={styles.filterBar}>
      <TouchableOpacity style={styles.filterButton} onPress={onTypePress}>
        <Ionicons name="book-outline" size={14} color={COLORS.text.light} />
        <Text style={styles.filterButtonText} numberOfLines={1}>
          {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton} onPress={onPlanPress}>
        <Ionicons name="time-outline" size={14} color={COLORS.text.light} />
        <Text style={styles.filterButtonText} numberOfLines={1}>
          {studyPlan ? `${studyPlan.days}d` : 'Plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
