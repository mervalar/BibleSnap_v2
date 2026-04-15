import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../styles/bIbleStudyContent.styles';

let DateTimePicker;
try {
  if (Platform.OS !== 'web') {
    const moduleName = '@react-native-community/datetimepicker';
    DateTimePicker = eval('require')(moduleName).default;
  } else {
    DateTimePicker = ({ value, onChange }) => null;
  }
} catch (e) {
  DateTimePicker = ({ value, onChange }) => null;
}

const styles = createStyles();

const formatDate = (d) => {
  if (!d) return '-';
  const date = (typeof d === 'string') ? new Date(d) : d;
  return date.toLocaleDateString();
};

const StudyPlanModal = ({
  visible,
  onClose,
  planDays,
  startDate,
  onSavePlan,
  bibleReadingsCount = 365,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localPlanDays, setLocalPlanDays] = useState(planDays || 365);

  // Sync with parent props when modal opens
  useEffect(() => {
    if (visible) {
      // Always start with today's date when opening the modal for a new plan
      setLocalStartDate(new Date());
      setLocalPlanDays(planDays || 365);
    }
  }, [visible, startDate, planDays]);

  const handlePlanSelect = (days) => {
    setLocalPlanDays(days);
    if (onSavePlan) {
      onSavePlan(days, localStartDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="calendar" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.modalTitle}>Choose Your Journey</Text>
          <Text style={styles.modalSubtitle}>Select a reading plan duration</Text>
          
          <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Text style={[styles.modalLabel, { fontSize: 12, marginBottom: 0 }]}>Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.dateButton, { paddingVertical: 6, paddingHorizontal: 10, minWidth: 120 }]}
            >
              <Ionicons name="calendar-outline" size={14} color={COLORS.text.secondary} />
              <Text style={[styles.dateButtonText, { fontSize: 12 }]}>{formatDate(localStartDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={localStartDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setLocalStartDate(selected);
                }}
              />
            )}
          </View>
          
          {[365, 180, 120, 90, 60, 30].map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => handlePlanSelect(d)}
              style={[styles.planOption, localPlanDays === d && styles.planOptionActive]}
            >
              <View style={styles.planOptionContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={[styles.planOptionText, localPlanDays === d && styles.planOptionTextActive]}>
                    {d} Days
                  </Text>
                  <Text style={[styles.planOptionSubtext, localPlanDays === d && styles.planOptionSubtextActive, { marginLeft: 8, marginTop: 0 }]}>
                    • {Math.ceil(bibleReadingsCount / d)} per day
                  </Text>
                </View>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={localPlanDays === d ? '#FFF' : COLORS.border.medium} 
                />
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StudyPlanModal;

