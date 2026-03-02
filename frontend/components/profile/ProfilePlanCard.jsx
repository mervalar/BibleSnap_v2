import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

export default function ProfilePlanCard({ studyPlanSummary }) {
  if (!studyPlanSummary) return null;

  const { days, percent, daysRemaining, finishDate, startDate, completedLessons, totalLessons, lessonsAhead, consistency } = studyPlanSummary;
  const consistencyLow = consistency !== undefined && consistency < 30;
  const consistencyHigh = consistency !== undefined && consistency >= 80;

  return (
    <View style={styles.planCard}>
      <Text style={styles.planTitle}>Reading Plan Progress</Text>
      <Text style={styles.planSubtitle}>
        {days}-day plan • Started {new Date(startDate).toLocaleDateString()}
      </Text>

      <View style={styles.planStats}>
        <View>
          <Text style={styles.planStatLabel}>Completed</Text>
          <Text style={styles.planStatValue}>{completedLessons}/{totalLessons}</Text>
        </View>
        <View style={styles.planStatRight}>
          <Text style={styles.planStatLabel}>Days Remaining</Text>
          <Text style={styles.planStatValue}>{daysRemaining}</Text>
        </View>
      </View>

      {lessonsAhead !== undefined && (
        <View style={[styles.planStats, { marginTop: 8 }]}>
          <View>
            <Text style={styles.planStatLabel}>
              {lessonsAhead >= 0 ? 'Lessons Ahead' : 'Lessons Behind'}
            </Text>
            <Text
              style={[
                styles.planStatValue,
                lessonsAhead >= 0 ? { color: COLORS.semantic.success } : { color: COLORS.semantic.error },
              ]}
            >
              {lessonsAhead >= 0 ? '+' : ''}{lessonsAhead}
            </Text>
          </View>
          {consistency !== undefined && (
            <View style={styles.planStatRight}>
              <Text style={styles.planStatLabel}>Consistency</Text>
              <Text style={styles.planStatValue}>{consistency}%</Text>
            </View>
          )}
        </View>
      )}

      {consistency !== undefined && (
        <View
          style={[
            styles.encouragementCard,
            consistencyLow && styles.encouragementCardSad,
            consistencyHigh && styles.encouragementCardHappy,
          ]}
        >
          <Text style={styles.encouragementCardEmoji}>
            {consistencyLow ? '😔' : consistencyHigh ? '✨' : '📖'}
          </Text>
          <Text style={styles.encouragementCardText}>
            {consistencyLow
              ? "You've been a bit inconsistent. Read more today to achieve your goal!"
              : consistencyHigh
              ? "Great consistency! You're doing amazing!"
              : "Keep going! You're making progress."}
          </Text>
        </View>
      )}

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.planFinishText}>
        Est. finish: {new Date(finishDate).toLocaleDateString()}
      </Text>
    </View>
  );
}
