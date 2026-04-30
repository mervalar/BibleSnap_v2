import { useState, useEffect } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

export default function ApplicationModal({ visible, onClose, onSave, initialNote }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(initialNote?.title || '');
    setNotes(initialNote?.content || '');
  }, [visible, initialNote]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), notes: notes.trim() });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.title}>{initialNote ? 'Edit Application' : 'New Application'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color={BROWN} />
            <Text style={styles.infoText}>An application is a specific action you commit to doing. Be concrete and measurable.</Text>
          </View>

          <Text style={styles.fieldLabel}>What will you do?</Text>
          <TextInput
            style={styles.mainInput}
            placeholder="e.g. Pray for 10 minutes every morning"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />

          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.mainInput, { minHeight: 80 }]}
            placeholder="Additional context or details…"
            placeholderTextColor="#bbb"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F4' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#fff',
  },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { backgroundColor: BROWN, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1, padding: 16 },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(160,117,83,0.08)', padding: 14, borderRadius: 12, marginBottom: 20, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: BROWN, lineHeight: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 4 },
  mainInput: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A1A', minHeight: 56, borderWidth: 1, borderColor: '#EEE', marginBottom: 16, lineHeight: 22 },
});
