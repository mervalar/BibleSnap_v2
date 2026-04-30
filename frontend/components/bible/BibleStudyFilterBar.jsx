import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

const btnStyle = { flex: 1, minWidth: 0, maxWidth: 9999 };

export default function BibleStudyFilterBar({ selectedType, onTypePress, studyPlan, onPlanPress, reminder, onReminderPress }) {
  const typeLabel = selectedType === 'pickupbook'
    ? 'Pick a Book'
    : selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

  const reminderLabel = reminder
    ? (() => {
        const { hour24, minute } = reminder;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        const h = hour24 % 12 || 12;
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
      })()
    : 'Reminder';

  return (
    <View style={styles.filterBar}>
      <TouchableOpacity style={[styles.filterButton, btnStyle]} onPress={onTypePress}>
        <Ionicons name="book-outline" size={12} color={COLORS.text.light} />
        <Text style={styles.filterButtonText} numberOfLines={1}>{typeLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.filterButton, btnStyle]} onPress={onPlanPress}>
        <Ionicons name="time-outline" size={12} color={COLORS.text.light} />
        <Text style={styles.filterButtonText} numberOfLines={1}>
          {studyPlan ? `${studyPlan.days}d` : 'Plan'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterButton, btnStyle, reminder && { borderColor: COLORS.primary, backgroundColor: 'rgba(139,93,51,0.35)' }]}
        onPress={onReminderPress}
      >
        <Ionicons name={reminder ? 'notifications' : 'notifications-outline'} size={12} color={COLORS.text.light} />
        <Text style={styles.filterButtonText} numberOfLines={1}>{reminderLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
