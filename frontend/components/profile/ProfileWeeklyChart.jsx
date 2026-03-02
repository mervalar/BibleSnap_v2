import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import styles from '../../styles/profile';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const insightStyleMap = {
  excellent: 'chartInsightExcellent',
  great: 'chartInsightGreat',
  good: 'chartInsightGood',
  encourage: 'chartInsightEncourage',
};

export default function ProfileWeeklyChart({
  weeklyProgress,
  weekTotal,
  weekAverage,
  currentStreak,
  chartInsight,
  selectedDayIndex,
  onDayPress,
}) {
  const maxValue = Math.max(...weeklyProgress, 1);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.chartTitle}>Weekly Reading Progress</Text>
          <View style={styles.chartStatsRow}>
            <View style={styles.chartStatItem}>
              <Ionicons name="book" size={14} color={COLORS.text.secondary} />
              <Text style={styles.chartStatText}>{weekTotal} lessons</Text>
            </View>
            <View style={styles.chartStatItem}>
              <Ionicons name="trending-up" size={14} color={COLORS.text.secondary} />
              <Text style={styles.chartStatText}>{weekAverage}/day avg</Text>
            </View>
            {currentStreak > 0 && (
              <View style={styles.chartStatItem}>
                <Ionicons name="flame" size={14} color={COLORS.primary} />
                <Text style={[styles.chartStatText, { color: COLORS.primary, fontWeight: '700' }]}>
                  {currentStreak} day streak
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {chartInsight && (
        <View
          style={[
            styles.chartInsight,
            chartInsight.type && styles[insightStyleMap[chartInsight.type]],
          ]}
        >
          <Text style={styles.chartInsightEmoji}>{chartInsight.emoji}</Text>
          <Text style={styles.chartInsightText}>{chartInsight.text}</Text>
        </View>
      )}

      <View style={styles.chartArea}>
        <View style={styles.barChartContainer}>
          {weeklyProgress.map((value, index) => {
            const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isSelected = selectedDayIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.barContainer}
                onPress={() => value > 0 && onDayPress(index, value)}
                activeOpacity={0.7}
              >
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${barHeight}%` },
                      value > 0 && styles.barFilled,
                      isSelected && styles.barSelected,
                    ]}
                  >
                    {value > 0 && <Text style={styles.barValue}>{value}</Text>}
                  </View>
                </View>
                <Text
                  style={[
                    styles.barDayLabel,
                    value > 0 && styles.barDayLabelActive,
                    isSelected && styles.barDayLabelSelected,
                  ]}
                >
                  {DAY_LABELS[index]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {weekAverage > 0 && (
          <View style={styles.averageLineContainer}>
            <View style={styles.averageLine} />
            <Text style={styles.averageLineLabel}>Avg: {weekAverage}/day</Text>
          </View>
        )}
      </View>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Lessons completed</Text>
        </View>
        {weekAverage > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotDashed, { borderColor: COLORS.text.secondary }]} />
            <Text style={styles.legendText}>Daily average</Text>
          </View>
        )}
      </View>
    </View>
  );
}
