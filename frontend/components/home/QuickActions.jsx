import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/home/QuickActions.styles';

const ACTIONS = [
  { key: 'study',   icon: 'book-outline',   label: 'Study', sub: 'the Word',    color: '#8B5D33', bg: 'rgba(139,93,51,0.1)' },
  { key: 'reflect', icon: 'create-outline', label: 'Reflect', sub: 'and journal', color: '#4A4A4A', bg: 'rgba(74,74,74,0.08)' },
  { key: 'apply',   icon: 'leaf-outline',   label: 'Apply', sub: 'in real life', color: '#4A7742', bg: 'rgba(74,119,66,0.1)' },
];

const QuickActions = ({ onStudyPress, onJournalPress, onApplicationPress }) => {
  const handlers = { study: onStudyPress, reflect: onJournalPress, apply: onApplicationPress };

  return (
    <View style={styles.quickActionsContainer}>
      <View style={styles.quickActionsRow}>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickActionItem}
            onPress={handlers[action.key]}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: action.bg }]}>
              <Ionicons name={action.icon} size={26} color={action.color} />
            </View>
            <Text style={styles.quickActionTitle}>{action.label}</Text>
            <Text style={styles.quickActionSubtitle}>{action.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;
