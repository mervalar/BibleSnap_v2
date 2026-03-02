import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileMenu({ journalCount, onJournal, onLogout }) {
  return (
    <View style={styles.menuCard}>
      <TouchableOpacity style={styles.menuItem} onPress={onJournal}>
        <View style={styles.menuIcon}>
          <Ionicons name="journal" size={20} color={COLORS.semantic.info} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuText}>My Journals</Text>
          <Text style={styles.menuSubtext}>{journalCount} journal entries</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.light} />
      </TouchableOpacity>
      <View style={styles.menuDivider} />
      <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
        <View style={[styles.menuIcon, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
          <Ionicons name="log-out" size={20} color={COLORS.semantic.error} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuText, { color: COLORS.semantic.error }]}>Logout</Text>
          <Text style={styles.menuSubtext}>Sign out of your account</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
