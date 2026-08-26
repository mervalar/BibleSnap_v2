import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/bIbleStudyContent.styles';
import {
  scheduleReminder,
  cancelReminder,
  scheduleJournalReminder,
  cancelJournalReminder,
  formatReminderLabel,
} from '../utils/notificationService';
import styles from '../styles/ReminderModal.styles';

const HOURS_DATA = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_DATA = Array.from({ length: 60 }, (_, i) => i);
const AMPM_DATA = ['AM', 'PM'];
const ITEM_H = 48;

function DrumPicker({ data, scrollRef, onScrollEnd, formatItem, width, selectedIndex }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ width, height: ITEM_H * 3, overflow: 'hidden' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
          borderTopWidth: 1.5, borderBottomWidth: 1.5,
          borderColor: 'rgba(139,93,51,0.35)', zIndex: 2,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}
        onMomentumScrollEnd={onScrollEnd}
      >
        {data.map((item, idx) => (
          <View key={idx} style={{ height: ITEM_H, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{
              fontSize: 22,
              fontWeight: idx === selectedIndex ? '700' : '400',
              color: idx === selectedIndex ? COLORS.primary : COLORS.text.tertiary,
            }}>
              {formatItem ? formatItem(item) : String(item)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H, backgroundColor: COLORS.background, opacity: 0.92, zIndex: 1 }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H, backgroundColor: COLORS.background, opacity: 0.92, zIndex: 1 }} />
    </View>
  );
}

export default function ReminderModal({ visible, onClose, currentReminder, onReminderChange, currentJournalReminder, onJournalReminderChange }) {
  const [activeTab, setActiveTab] = useState('bible');
  const [saving, setSaving] = useState(false);

  // Bible study reminder state
  const [ampm, setAmpm] = useState('AM');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const ampmScrollRef = useRef(null);

  // Journal reminder state
  const [jAmpm, setJAmpm] = useState('AM');
  const [jHour, setJHour] = useState(9);
  const [jMinute, setJMinute] = useState(0);
  const jHourScrollRef = useRef(null);
  const jMinuteScrollRef = useRef(null);
  const jAmpmScrollRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    let h = 7, m = 0, ap = 'AM';
    if (currentReminder) {
      const { hour24, minute: rm } = currentReminder;
      ap = hour24 >= 12 ? 'PM' : 'AM';
      h = hour24 % 12 || 12;
      m = rm;
    }
    setHour(h); setMinute(m); setAmpm(ap);

    let jh = 9, jm = 0, jap = 'AM';
    if (currentJournalReminder) {
      const { hour24: jh24, minute: jrm } = currentJournalReminder;
      jap = jh24 >= 12 ? 'PM' : 'AM';
      jh = jh24 % 12 || 12;
      jm = jrm;
    }
    setJHour(jh); setJMinute(jm); setJAmpm(jap);

    setActiveTab('bible');
  }, [visible, currentReminder, currentJournalReminder]);

  const bibleHour24 = ampm === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
  const journalHour24 = jAmpm === 'AM' ? (jHour === 12 ? 0 : jHour) : (jHour === 12 ? 12 : jHour + 12);
  const previewLabel = activeTab === 'bible'
    ? formatReminderLabel({ hour24: bibleHour24, minute })
    : formatReminderLabel({ hour24: journalHour24, minute: jMinute });

  const handleSet = async () => {
    setSaving(true);
    let ok;
    if (activeTab === 'bible') {
      ok = await scheduleReminder(bibleHour24, minute);
      if (ok) onReminderChange?.({ hour24: bibleHour24, minute });
    } else {
      ok = await scheduleJournalReminder(journalHour24, jMinute);
      if (ok) onJournalReminderChange?.({ hour24: journalHour24, minute: jMinute });
    }
    setSaving(false);
    if (ok) {
      onClose();
    } else {
      Alert.alert(
        'Permission required',
        'Please enable notifications in your device settings so BiblePause can remind you.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemove = async () => {
    if (activeTab === 'bible') {
      await cancelReminder();
      onReminderChange?.(null);
    } else {
      await cancelJournalReminder();
      onJournalReminderChange?.(null);
    }
    onClose();
  };

  const hasActiveReminder = activeTab === 'bible' ? !!currentReminder : !!currentJournalReminder;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Ionicons name="notifications" size={22} color={COLORS.primary} />
            <Text style={styles.title}>Daily Reminders</Text>
          </View>
          <Text style={styles.subtitle}>Set reminders to stay consistent in your walk.</Text>

          {/* Tab bar */}
          <View style={styles.tabRow}>
            {[
              { key: 'bible', label: 'Bible Study', icon: 'book-outline' },
              { key: 'journal', label: 'Journal', icon: 'create-outline' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && styles.tabActive]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={t.icon} size={13} color={activeTab === t.key ? '#fff' : COLORS.text.tertiary} />
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bible Study pickers */}
          {activeTab === 'bible' && (
            <View style={styles.pickerRow}>
              <DrumPicker data={HOURS_DATA} scrollRef={hourScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setHour(HOURS_DATA[Math.max(0, Math.min(11, idx))]); }} selectedIndex={hour - 1} width={64} />
              <Text style={styles.pickerColon}>:</Text>
              <DrumPicker data={MINUTES_DATA} scrollRef={minuteScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setMinute(Math.max(0, Math.min(59, idx))); }} formatItem={(m) => String(m).padStart(2, '0')} selectedIndex={minute} width={64} />
              <DrumPicker data={AMPM_DATA} scrollRef={ampmScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setAmpm(idx === 0 ? 'AM' : 'PM'); }} selectedIndex={ampm === 'AM' ? 0 : 1} width={72} />
            </View>
          )}

          {/* Journal pickers */}
          {activeTab === 'journal' && (
            <View style={styles.pickerRow}>
              <DrumPicker data={HOURS_DATA} scrollRef={jHourScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setJHour(HOURS_DATA[Math.max(0, Math.min(11, idx))]); }} selectedIndex={jHour - 1} width={64} />
              <Text style={styles.pickerColon}>:</Text>
              <DrumPicker data={MINUTES_DATA} scrollRef={jMinuteScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setJMinute(Math.max(0, Math.min(59, idx))); }} formatItem={(m) => String(m).padStart(2, '0')} selectedIndex={jMinute} width={64} />
              <DrumPicker data={AMPM_DATA} scrollRef={jAmpmScrollRef} onScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); setJAmpm(idx === 0 ? 'AM' : 'PM'); }} selectedIndex={jAmpm === 'AM' ? 0 : 1} width={72} />
            </View>
          )}

          <View style={styles.preview}>
            <Text style={styles.previewTime}>{previewLabel}</Text>
            <Text style={styles.previewLabel}>
              {activeTab === 'bible' ? 'Bible study reminder' : 'Journal reminder'} will fire at this time
            </Text>
          </View>

          <TouchableOpacity style={styles.setBtn} onPress={handleSet} disabled={saving} activeOpacity={0.8}>
            <Ionicons name="notifications" size={18} color="#fff" />
            <Text style={styles.setBtnText}>{saving ? 'Saving…' : hasActiveReminder ? 'Update Reminder' : 'Set Reminder'}</Text>
          </TouchableOpacity>

          {hasActiveReminder && (
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
