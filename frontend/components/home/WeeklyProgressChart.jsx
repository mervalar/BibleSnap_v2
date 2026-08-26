import { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadWeeklyProgressFromStorage } from '../../utils/profileStats';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BROWN = '#8B5D33';

export default function WeeklyProgressChart() {
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [streak, setStreak] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      const { weekData, streak: s, total } = await loadWeeklyProgressFromStorage();
      setWeeklyProgress(weekData);
      setStreak(s);
      setWeekTotal(total);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>This week</Text>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={12} color="#FF6B35" />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        )}
      </View>

      <View style={styles.dotsRow}>
        {DAY_LABELS.map((day, i) => (
          <View key={i} style={styles.dayCol}>
            <View style={[styles.dot, weeklyProgress[i] > 0 && styles.dotActive]}>
              {weeklyProgress[i] > 0 && (
                <Ionicons name="checkmark" size={10} color="#fff" />
              )}
            </View>
            <Text style={styles.dayLabel}>{day}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.summary}>
        {weekTotal} session{weekTotal !== 1 ? 's' : ''} completed this week
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 249, 242, 0.96)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.08)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: BROWN,
    borderColor: BROWN,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAA',
  },
  summary: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
  },
});
