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
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
