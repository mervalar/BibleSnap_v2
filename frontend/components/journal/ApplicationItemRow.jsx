import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing, { progressColor } from './ProgressRing';

const BROWN = '#A07553';

export default function ApplicationItemRow({ note, onEdit, onDelete }) {
  const percent = note.progress_percent ?? 0;
  const activeColor = progressColor(percent);

  return (
    <View style={[styles.card, { borderLeftColor: activeColor }]}>
      <ProgressRing percent={percent} />
      <View style={styles.body}>
        {/* Title + actions */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>{note.title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={16} color={BROWN} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {note.soap_scripture ? <Text style={styles.verse}>{note.soap_scripture}</Text> : null}
        {note.content ? <Text style={styles.notes} numberOfLines={2}>{note.content}</Text> : null}

        <Text style={styles.date}>{note.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, padding: 14,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  body: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A1A', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 4 },
  verse: { fontSize: 12, color: BROWN, fontWeight: '600', marginBottom: 4 },
  notes: { fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 18 },
  date: { fontSize: 10, color: '#bbb' },
});
