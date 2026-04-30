import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

const STATUS_CONFIG = {
  not_started: { label: 'Not started', color: '#9E9E9E', icon: 'ellipse-outline' },
  in_progress:  { label: 'In progress',  color: '#FF9800', icon: 'time-outline' },
};

export default function TodayApplicationCard({ note, onPress }) {
  if (!note) return null;
  const cfg = STATUS_CONFIG[note.status] ?? STATUS_CONFIG.not_started;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Ionicons name="checkmark-circle" size={14} color={BROWN} />
          <Text style={styles.sectionLabel}>Application of the day</Text>
        </View>
        <View style={[styles.statusChip, { borderColor: cfg.color }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={styles.actionText} numberOfLines={3}>{note.title}</Text>

      <View style={styles.footer}>
        <Text style={styles.tapHint}>Tap to update your progress</Text>
        <Ionicons name="arrow-forward" size={13} color={BROWN} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: BROWN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: BROWN, textTransform: 'uppercase', letterSpacing: 0.6 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actionText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', lineHeight: 22, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tapHint: { fontSize: 11, color: '#bbb' },
});
