import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

const STATUS_CONFIG = {
  not_started: { label: 'Not started', color: '#9E9E9E', bg: 'rgba(158,158,158,0.12)', icon: 'ellipse-outline' },
  in_progress:  { label: 'In progress',  color: '#FF9800', bg: 'rgba(255,152,0,0.12)',  icon: 'time-outline' },
  completed:    { label: 'Completed',    color: '#4CAF50', bg: 'rgba(76,175,80,0.12)',  icon: 'checkmark-circle' },
};

const NEXT_STATUS = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' };

export default function ApplicationItemRow({ note, onStatusChange, onEdit, onDelete }) {
  const status = note.status || 'not_started';
  const cfg = STATUS_CONFIG[status];

  return (
    <View style={styles.card}>
      {/* Status indicator bar */}
      <View style={[styles.statusBar, { backgroundColor: cfg.color }]} />

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

        {/* Status row */}
        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[styles.statusChip, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
            onPress={() => onStatusChange(NEXT_STATUS[status])}
            activeOpacity={0.7}
          >
            <Ionicons name={cfg.icon} size={13} color={cfg.color} />
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Ionicons name="chevron-forward" size={10} color={cfg.color} />
          </TouchableOpacity>
          <Text style={styles.date}>{note.date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  statusBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A1A', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 4 },
  notes: { fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 10, color: '#bbb' },
});
