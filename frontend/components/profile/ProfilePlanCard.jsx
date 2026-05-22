import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#8B5D33';
const CARD_BG = 'rgba(255, 249, 242, 0.96)';

export default function ProfilePlanCard({ studyPlanSummary }) {
  if (!studyPlanSummary) return null;

  const {
    days, percent, daysRemaining, finishDate, startDate,
    completedLessons, totalLessons, lessonsAhead, consistency,
  } = studyPlanSummary;

  const consistencyLow = consistency !== undefined && consistency < 30;
  const consistencyHigh = consistency !== undefined && consistency >= 80;

  const startStr = startDate
    ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const finishStr = finishDate
    ? new Date(finishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="map-outline" size={18} color={BROWN} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Reading Plan</Text>
          <Text style={styles.subtitle}>{days}-day plan · Started {startStr}</Text>
        </View>
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{percent}%</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%` }]} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedLessons}/{totalLessons}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{daysRemaining}</Text>
          <Text style={styles.statLabel}>Days Left</Text>
        </View>
        {lessonsAhead !== undefined && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, lessonsAhead >= 0 ? styles.ahead : styles.behind]}>
                {lessonsAhead >= 0 ? `+${lessonsAhead}` : lessonsAhead}
              </Text>
              <Text style={styles.statLabel}>{lessonsAhead >= 0 ? 'Ahead' : 'Behind'}</Text>
            </View>
          </>
        )}
        {consistency !== undefined && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{consistency}%</Text>
              <Text style={styles.statLabel}>Consistent</Text>
            </View>
          </>
        )}
      </View>

      {/* Encouragement */}
      {consistency !== undefined && (
        <View style={[
          styles.encouragement,
          consistencyLow && styles.encouragementSad,
          consistencyHigh && styles.encouragementHappy,
        ]}>
          <Text style={styles.encouragementEmoji}>
            {consistencyLow ? '😔' : consistencyHigh ? '✨' : '📖'}
          </Text>
          <Text style={styles.encouragementText}>
            {consistencyLow
              ? "You've been a bit inconsistent. Read more today to achieve your goal!"
              : consistencyHigh
              ? "Great consistency! You're doing amazing!"
              : "Keep going! You're making progress."}
          </Text>
        </View>
      )}

      {/* Est. finish */}
      {finishStr && (
        <Text style={styles.finishText}>Est. completion: {finishStr}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(139,93,51,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D2417',
  },
  subtitle: {
    fontSize: 11,
    color: '#9B8870',
    marginTop: 1,
  },
  pctBadge: {
    backgroundColor: BROWN,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(139,93,51,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BROWN,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2417',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#9B8870',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(139,93,51,0.12)',
  },
  ahead: { color: '#4A6741' },
  behind: { color: '#E53935' },
  encouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139,93,51,0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: BROWN,
  },
  encouragementSad: {
    backgroundColor: 'rgba(229,57,53,0.06)',
    borderLeftColor: '#E53935',
  },
  encouragementHappy: {
    backgroundColor: 'rgba(74,103,65,0.06)',
    borderLeftColor: '#4A6741',
  },
  encouragementEmoji: { fontSize: 18 },
  encouragementText: {
    flex: 1,
    fontSize: 12,
    color: '#2D2417',
    fontWeight: '600',
    lineHeight: 17,
  },
  finishText: {
    fontSize: 11,
    color: '#9B8870',
    textAlign: 'right',
  },
});
