import { useState, useEffect } from 'react';
import {
  View, Text, Modal, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';
const BG = '#FAF7F4';

const SOAP_FIELDS = [
  { key: 'scripture', label: 'Scripture', icon: 'book-outline', placeholder: 'Write the Bible verse or passage…', hint: 'What does the text say?', multiline: true },
  { key: 'observation', label: 'Observation', icon: 'eye-outline', placeholder: 'What do you notice or understand from this passage?', hint: 'What stands out to you?', multiline: true },
  { key: 'application', label: 'Application', icon: 'flash-outline', placeholder: 'How will you apply this in your life today?', hint: 'What specific action will you take?', multiline: true },
  { key: 'prayer', label: 'Prayer', icon: 'hand-right-outline', placeholder: 'Write a short personal prayer…', hint: 'Talk to God about what you read.', multiline: true },
];

export default function SoapJourneyModal({ visible, onClose, onSave, initialNote }) {
  const [title, setTitle] = useState('');
  const [soap, setSoap] = useState({ scripture: '', observation: '', application: '', prayer: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initialNote) {
      setTitle(initialNote.title || '');
      setSoap({
        scripture: initialNote.soap_scripture || '',
        observation: initialNote.soap_observation || '',
        application: initialNote.soap_application || '',
        prayer: initialNote.soap_prayer || '',
      });
    } else {
      setTitle('');
      setSoap({ scripture: '', observation: '', application: '', prayer: '' });
    }
  }, [visible, initialNote]);

  const handleSave = async () => {
    if (!soap.scripture.trim()) {
      return;
    }
    setSaving(true);
    await onSave({ title: title || 'Journey Entry', ...soap });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{initialNote ? 'Edit Journey' : 'New Journey'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.titleRow}>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry title (optional)"
              placeholderTextColor="#bbb"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* SOAP sections */}
          {SOAP_FIELDS.map((f, idx) => (
            <View key={f.key} style={styles.soapSection}>
              <View style={styles.soapLabelRow}>
                <View style={[styles.soapBadge, idx === 0 && styles.badge0, idx === 1 && styles.badge1, idx === 2 && styles.badge2, idx === 3 && styles.badge3]}>
                  <Text style={styles.soapLetter}>{f.label[0]}</Text>
                </View>
                <Text style={styles.soapLabel}>{f.label}</Text>
              </View>
              <TextInput
                style={styles.soapInput}
                placeholder={f.hint}
                placeholderTextColor="#bbb"
                value={soap[f.key]}
                onChangeText={(v) => setSoap((p) => ({ ...p, [f.key]: v }))}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}

          {/* Save to Application hint */}
          {soap.application.trim().length > 0 && (
            <View style={styles.appHint}>
              <Ionicons name="information-circle-outline" size={14} color={BROWN} />
              <Text style={styles.appHintText}>After saving, you can send your Application to the tracker from the card.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#fff',
  },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { backgroundColor: BROWN, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  titleRow: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  titleInput: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
  soapSection: { marginHorizontal: 16, marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  soapLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  soapBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  badge0: { backgroundColor: '#4A90D9' },
  badge1: { backgroundColor: '#7B68EE' },
  badge2: { backgroundColor: '#E07B39' },
  badge3: { backgroundColor: '#4A9B6F' },
  soapLetter: { color: '#fff', fontWeight: '800', fontSize: 16 },
  soapLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  soapInput: { fontSize: 14, color: '#333', lineHeight: 22, minHeight: 80, backgroundColor: '#FAF7F4', borderRadius: 10, padding: 12 },
  appHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: 'rgba(160,117,83,0.08)', padding: 12, borderRadius: 10 },
  appHintText: { flex: 1, fontSize: 12, color: BROWN, lineHeight: 18 },
});
