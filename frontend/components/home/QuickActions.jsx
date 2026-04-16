import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/home/QuickActions.styles';

const QuickActions = ({ onReadBible, onJournalPress, onBibleStudyPress }) => {
  return (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickActionCard, styles.prayerCard]}
        onPress={onReadBible}
      >
        <Ionicons name="book-outline" size={32} color="#fff" style={styles.quickActionIcon} />
        <Text style={styles.quickActionTitle}>Read Bible</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.studyCard]}
        onPress={onJournalPress}
      >
        <Ionicons name="create-outline" size={32} color="#fff" style={styles.quickActionIcon} />
        <Text style={styles.quickActionTitle}>Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionCard, styles.assistantCard]}
        onPress={onBibleStudyPress}
      >
        <Ionicons name="school-outline" size={32} color="#fff" style={styles.quickActionIcon} />
        <Text style={styles.quickActionTitle}>Bible study</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions;

