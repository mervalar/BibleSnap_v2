import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/bIbleStudyContent.styles';
import { scheduleReminder, cancelReminder, formatReminderLabel } from '../utils/notificationService';
import styles from '../styles/ReminderModal.styles';

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];

export default function ReminderModal({ visible, onClose, currentReminder, onReminderChange }) {
  const [ampm, setAmpm] = useState('AM');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (currentReminder) {
      const { hour24, minute: m } = currentReminder;
      setAmpm(hour24 >= 12 ? 'PM' : 'AM');
      setHour(hour24 % 12 || 12);
      setMinute(m);
    } else {
      setAmpm('AM');
      setHour(7);
      setMinute(0);
    }
  }, [visible, currentReminder]);

  const hour24 = ampm === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
  const previewLabel = formatReminderLabel({ hour24, minute });

  const handleSet = async () => {
    setSaving(true);
    const ok = await scheduleReminder(hour24, minute);
    setSaving(false);
    if (ok) {
      onReminderChange({ hour24, minute });
      onClose();
    } else {
      Alert.alert(
        'Permission required',
        'Please enable notifications in your device settings so BibleSnap can remind you to read.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemove = async () => {
    await cancelReminder();
    onReminderChange(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Ionicons name="notifications" size={22} color={COLORS.primary} />
            <Text style={styles.title}>Daily Reminder</Text>
          </View>
          <Text style={styles.subtitle}>Pick a time and we'll remind you to read every day.</Text>

          {/* AM / PM */}
          <View style={styles.ampmRow}>
            {['AM', 'PM'].map((v) => (
              <TouchableOpacity key={v} style={[styles.ampmBtn, ampm === v && styles.ampmBtnActive]} onPress={() => setAmpm(v)}>
                <Text style={[styles.ampmText, ampm === v && styles.ampmTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hour */}
          <Text style={styles.sectionLabel}>Hour</Text>
          <View style={styles.hourGrid}>
            {HOURS.map((h) => (
              <TouchableOpacity key={h} style={[styles.hourChip, hour === h && styles.hourChipActive]} onPress={() => setHour(h)}>
                <Text style={[styles.hourText, hour === h && styles.hourTextActive]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Minute */}
          <Text style={styles.sectionLabel}>Minute</Text>
          <View style={styles.minuteRow}>
            {MINUTES.map((m) => (
              <TouchableOpacity key={m} style={[styles.minuteChip, minute === m && styles.minuteChipActive]} onPress={() => setMinute(m)}>
                <Text style={[styles.minuteText, minute === m && styles.minuteTextActive]}>:{String(m).padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewTime}>{previewLabel}</Text>
            <Text style={styles.previewLabel}>Daily reminder will fire at this time</Text>
          </View>

          {/* Set */}
          <TouchableOpacity style={styles.setBtn} onPress={handleSet} disabled={saving} activeOpacity={0.8}>
            <Ionicons name="notifications" size={18} color="#fff" />
            <Text style={styles.setBtnText}>{saving ? 'Saving…' : currentReminder ? 'Update Reminder' : 'Set Reminder'}</Text>
          </TouchableOpacity>

          {/* Remove */}
          {currentReminder && (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
              <Ionicons name="notifications-off-outline" size={16} color={COLORS.semantic.error} />
              <Text style={styles.removeBtnText}>Remove Reminder</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
