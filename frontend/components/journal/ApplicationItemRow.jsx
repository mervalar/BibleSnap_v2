import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

const STATUSES = [
  { key: 'not_started', label: 'Not yet',     color: '#9E9E9E', icon: 'ellipse-outline' },
  { key: 'in_progress', label: 'In progress', color: '#FF9800', icon: 'time-outline' },
  { key: 'completed',   label: 'Done',         color: '#4CAF50', icon: 'checkmark-circle' },
];

export default function ApplicationItemRow({ note, onStatusChange, onEdit, onDelete }) {
  const status = note.status || 'not_started';

  const activeColor = STATUSES.find((s) => s.key === status)?.color || '#9E9E9E';

  return (
    <View style={[styles.card, { borderLeftColor: activeColor }]}>
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

        {note.content ? <Text style={styles.notes} numberOfLines={2}>{note.content}</Text> : null}

        {/* Status buttons */}
        <View style={styles.statusRow}>
          {STATUSES.map((s) => {
            const active = status === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.statusBtn, active && { backgroundColor: s.color, borderColor: s.color }]}
                onPress={() => onStatusChange(s.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={s.icon} size={12} color={active ? '#fff' : '#bbb'} />
                <Text style={[styles.statusLabel, active && styles.statusLabelActive]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.date}>{note.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A1A', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 4 },
  notes: { fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 18 },
  statusRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statusLabel: { fontSize: 11, fontWeight: '600', color: '#bbb' },
  statusLabelActive: { color: '#fff' },
  date: { fontSize: 10, color: '#bbb' },
});
