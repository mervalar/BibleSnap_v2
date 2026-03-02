import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfileProgressModal({
  visible,
  onClose,
  selectedDayData,
  weekAverage,
}) {
  if (!selectedDayData) return null;

  const aboveAverage = selectedDayData.value >= weekAverage;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.progressModalOverlay}>
        <View style={styles.progressModalContent}>
          <View style={styles.progressModalHeader}>
            <Ionicons name="stats-chart" size={32} color={COLORS.primary} />
            <Text style={styles.progressModalTitle}>Daily Progress</Text>
            <TouchableOpacity style={styles.progressModalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressModalBody}>
            <View style={styles.progressModalSection}>
              <View style={styles.progressModalDayHeader}>
                <Ionicons name="calendar" size={28} color={COLORS.primary} />
                <Text style={styles.progressModalDayTitle}>{selectedDayData.day}</Text>
              </View>
            </View>

            <View style={styles.progressModalSection}>
              <View style={styles.progressModalStatCard}>
                <Ionicons name="book" size={32} color={COLORS.primary} />
                <View style={styles.progressModalStatContent}>
                  <Text style={styles.progressModalStatValue}>{selectedDayData.value}</Text>
                  <Text style={styles.progressModalStatLabel}>
                    Lesson{selectedDayData.value !== 1 ? 's' : ''} Completed
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressModalSection}>
              <Text style={styles.progressModalSectionTitle}>Weekly Comparison</Text>
              <View style={styles.progressModalComparison}>
                <View style={styles.progressModalComparisonItem}>
                  <Text style={styles.progressModalComparisonLabel}>This Day</Text>
                  <Text style={styles.progressModalComparisonValue}>
                    {selectedDayData.value} lesson{selectedDayData.value !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.progressModalComparisonDivider} />
                <View style={styles.progressModalComparisonItem}>
                  <Text style={styles.progressModalComparisonLabel}>Daily Average</Text>
                  <Text style={styles.progressModalComparisonValue}>
                    {weekAverage.toFixed(1)} lesson{weekAverage !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>

            {aboveAverage ? (
              <View style={styles.progressModalEncouragement}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.semantic.success} />
                <Text style={styles.progressModalEncouragementText}>
                  Great job! You're above your daily average!
                </Text>
              </View>
            ) : (
              <View style={[styles.progressModalEncouragement, styles.progressModalEncouragementNeutral]}>
                <Ionicons name="trending-up" size={24} color={COLORS.primary} />
                <Text style={styles.progressModalEncouragementText}>
                  Keep going! Try to reach your daily average of {weekAverage.toFixed(1)} lessons.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
