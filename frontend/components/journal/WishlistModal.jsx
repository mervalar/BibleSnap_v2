import { useState, useEffect } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

const EXAMPLES = [
  '"I didn\'t see a way, but God used my boss to bless me"',
  '"Never feel tired because God is always in control"',
  '"Trusting God with my finances even when it\'s hard"',
];

export default function WishlistModal({ visible, onClose, onSave, initialNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(initialNote?.title || '');
    setContent(initialNote?.content || '');
  }, [visible, initialNote]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), content: content.trim() });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{initialNote ? 'Edit Entry' : 'New Wishlist Entry'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Ionicons name="heart" size={18} color={BROWN} />
            <Text style={styles.infoText}>Record your gratitude, faith goals, and testimonies here. Mark them as answered when God responds.</Text>
          </View>

          <Text style={styles.fieldLabel}>Headline</Text>
          <TextInput
            style={styles.mainInput}
            placeholder="e.g. Trusting God with my job situation"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            maxLength={150}
          />

          <Text style={styles.fieldLabel}>Details (optional)</Text>
          <TextInput
            style={[styles.mainInput, { minHeight: 100 }]}
            placeholder="Share more about your faith, the situation, or how you're trusting God…"
            placeholderTextColor="#bbb"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {!initialNote && (
            <View style={styles.examplesBox}>
              <Text style={styles.examplesTitle}>Ideas to get started:</Text>
              {EXAMPLES.map((ex, i) => (
                <TouchableOpacity key={i} onPress={() => setTitle(ex.replace(/"/g, ''))} style={styles.exampleRow}>
                  <Ionicons name="arrow-forward-circle-outline" size={14} color={BROWN} />
                  <Text style={styles.exampleText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { backgroundColor: BROWN, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1, padding: 16 },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(160,117,83,0.08)', padding: 14, borderRadius: 12, marginBottom: 20, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: BROWN, lineHeight: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 4 },
  mainInput: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A1A', minHeight: 52, borderWidth: 1, borderColor: '#EEE', marginBottom: 16, lineHeight: 22 },
  examplesBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EEE' },
  examplesTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  exampleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  exampleText: { flex: 1, fontSize: 13, color: BROWN, lineHeight: 19, fontStyle: 'italic' },
});
