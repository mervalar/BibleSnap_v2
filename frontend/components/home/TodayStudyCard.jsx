import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBooks } from '../../utils/bibleStudyContentUtils';

const BROWN = '#8B5D33';
const GREEN = '#4A7742';

export default function TodayStudyCard({ study, onPress }) {
  if (!study?.reading) return null;
  const { reading } = study;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header strip */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="school" size={15} color={GREEN} />
          <Text style={styles.sectionLabel}>Today's Study</Text>
        </View>
        <View style={styles.dayChip}>
          <Text style={styles.dayText}>Day {reading.day}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.actionText} numberOfLines={2}>{reading.theme || 'Daily Reading'}</Text>
      <Text style={styles.booksText} numberOfLines={1}>{formatBooks(reading.books)}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.tapHint}>Tap to start today's lesson</Text>
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
  dayChip: {
    backgroundColor: 'rgba(74,119,66,0.12)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  dayText: { fontSize: 11, fontWeight: '700', color: GREEN },
  actionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D1A0E',
    lineHeight: 24,
    marginBottom: 4,
  },
  booksText: {
    fontSize: 13,
    color: '#A08060',
    fontWeight: '600',
    marginBottom: 14,
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
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
