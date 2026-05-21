import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';
const GREEN = '#4CAF50';

function formatDate(d) {
  if (!d) return '';
  const [year, month, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

export default function WishlistItemCard({ note, onMarkAnswered, onEdit, onDelete }) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [reason, setReason] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleMarkAnswered = () => {
    Alert.alert(
      'Mark as Answered',
      'Record this as an answered prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            onMarkAnswered(reason.trim(), today);
            setShowAnswerForm(false);
            setReason('');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, note.is_answered && styles.cardAnswered]}>
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={note.is_answered ? 'heart' : 'heart-outline'} size={16} color={note.is_answered ? GREEN : BROWN} />
        </View>
        <Text style={styles.date}>{note.date}</Text>
        <View style={styles.actions}>
          {!note.is_answered && (
            <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={15} color={BROWN} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={15} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{note.title}</Text>

      {/* Answered state */}
      {note.is_answered && (
        <>
          <View style={styles.answeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={GREEN} />
            <Text style={styles.answeredText}>Answered</Text>
            {note.answered_date ? (
              <Text style={styles.answeredDate}>· {formatDate(note.answered_date)}</Text>
            ) : null}
          </View>
          {note.answer_reason ? (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>How God answered:</Text>
              <Text style={styles.reasonText}>{note.answer_reason}</Text>
            </View>
          ) : null}
        </>
      )}

      {/* Mark as answered button */}
      {!note.is_answered && !showAnswerForm && (
        <TouchableOpacity style={styles.markBtn} onPress={() => setShowAnswerForm(true)}>
          <Ionicons name="checkmark-done-outline" size={14} color={GREEN} />
          <Text style={styles.markBtnText}>Mark as Answered</Text>
        </TouchableOpacity>
      )}

      {/* Answer form */}
      {!note.is_answered && showAnswerForm && (
        <View style={styles.answerForm}>
          <Text style={styles.answerFormLabel}>How did God answer this? (optional)</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Share your testimony… (optional)"
            placeholderTextColor="#bbb"
            value={reason}
            onChangeText={setReason}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.answerFormBtns}>
            <TouchableOpacity onPress={() => { setShowAnswerForm(false); setReason(''); }} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMarkAnswered} style={styles.confirmBtn}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
    borderLeftWidth: 3, borderLeftColor: BROWN,
  },
  cardAnswered: { borderLeftColor: GREEN },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(160,117,83,0.1)', justifyContent: 'center', alignItems: 'center' },
  date: { flex: 1, fontSize: 11, color: '#bbb' },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  answeredBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  answeredText: { fontSize: 12, fontWeight: '700', color: GREEN },
  answeredDate: { fontSize: 11, color: '#999' },
  reasonBox: { backgroundColor: 'rgba(76,175,80,0.06)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)' },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  reasonText: { fontSize: 13, color: '#333', lineHeight: 20 },
  markBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: GREEN, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { fontSize: 12, color: GREEN, fontWeight: '700' },
  answerForm: { marginTop: 6 },
  answerFormLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6 },
  answerInput: { backgroundColor: '#FAF7F4', borderRadius: 10, padding: 12, fontSize: 13, color: '#333', minHeight: 70, borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  answerFormBtns: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#DDD' },
  cancelBtnText: { fontSize: 13, color: '#888', fontWeight: '600' },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: GREEN },
  confirmBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});
