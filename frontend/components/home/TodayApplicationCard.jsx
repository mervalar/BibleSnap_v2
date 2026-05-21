import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#8B5D33';

const STATUS_CONFIG = {
  not_started: {
    label: 'Not started',
    color: '#9E9E9E',
    chipBg: 'rgba(158,158,158,0.12)',
    icon: 'ellipse-outline',
    progress: 0.08,
  },
  in_progress: {
    label: 'In progress',
    color: '#FF9800',
    chipBg: 'rgba(255,152,0,0.12)',
    icon: 'time-outline',
    progress: 0.5,
  },
};

export default function TodayApplicationCard({ note, onPress }) {
  if (!note) return null;
  const cfg = STATUS_CONFIG[note.status] ?? STATUS_CONFIG.not_started;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header strip */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="checkmark-done-circle" size={15} color={BROWN} />
          <Text style={styles.sectionLabel}>Today's Action</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: cfg.chipBg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.actionText} numberOfLines={2}>{note.title}</Text>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${cfg.progress * 100}%`, backgroundColor: cfg.color }]} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.tapHint}>Tap to update your progress</Text>
        <View style={styles.arrowBtn}>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,249,242,0.97)',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#8B5D33',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.12)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: BROWN,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  actionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D1A0E',
    lineHeight: 24,
    marginBottom: 14,
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(139,93,51,0.1)',
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapHint: { fontSize: 12, color: '#A08060', fontWeight: '500' },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
