import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/home/QuickActions.styles';

const QuickActions = ({ onReadBible, onJournalPress, onBibleStudyPress }) => {
  return (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickActionCard, styles.prayerCard]}
        onPress={onReadBible}
      >
        <Text style={styles.quickActionIcon}>📖</Text>
        <Text style={styles.quickActionTitle}>Read Bible</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.studyCard]}
        onPress={onJournalPress}
      >
        <Text style={styles.quickActionIcon}>✍️</Text>
        <Text style={styles.quickActionTitle}>Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.assistantCard]}
        onPress={onBibleStudyPress}
      >
        <Text style={styles.quickActionIcon}>🎓</Text>
        <Text style={styles.quickActionTitle}>Bible study</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions;

