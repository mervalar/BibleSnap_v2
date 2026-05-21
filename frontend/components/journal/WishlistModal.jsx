import { useState, useEffect } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

export default function WishlistModal({ visible, onClose, onSave, initialNote }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(initialNote?.title || '');
  }, [visible, initialNote]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), content: '' });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{initialNote ? 'Edit Wish' : 'New Wish'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()} style={[styles.saveBtn, (!title.trim() || saving) && { opacity: 0.4 }]}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <TextInput
            style={styles.input}
            placeholder="Write your wish, prayer, or faith goal…"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { backgroundColor: BROWN, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  body: { flex: 1, padding: 20 },
  input: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    fontSize: 16, color: '#1A1A1A', minHeight: 120,
    borderWidth: 1, borderColor: '#EEE', lineHeight: 24,
  },
});
