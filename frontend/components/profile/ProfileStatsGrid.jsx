import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATS = [
  { icon: 'bookmark', color: '#8B5D33', bg: 'rgba(139,93,51,0.1)', label: 'Saved' },
  { icon: 'journal',  color: '#4A6741', bg: 'rgba(74,103,65,0.1)',  label: 'Journals' },
  { icon: 'flame',    color: '#E07B39', bg: 'rgba(224,123,57,0.1)', label: 'Plan %' },
];

export default function ProfileStatsGrid({ savedVersesCount, journalCount, studyPlanSummary }) {
  const values = [
    savedVersesCount,
    journalCount,
    studyPlanSummary ? `${studyPlanSummary.percent}%` : '—',
  ];

  return (
    <View style={styles.row}>
      {STATS.map((s, i) => (
        <View key={s.label} style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={20} color={s.color} />
          </View>
          <Text style={styles.value}>{values[i]}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 249, 242, 0.96)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D2417',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#8B7355',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
