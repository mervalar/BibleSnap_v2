import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from '../../styles/home/WeeklyProgressChart.styles';
import { loadWeeklyProgressFromStorage } from '../../utils/profileStats';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS_CHART = {
  completed: '#A07553',
  incomplete: '#E0D4CC',
};

export default function WeeklyProgressChart() {
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [stats, setStats] = useState({ daysActive: 0, total: 0, average: 0, completionRate: 0 });

  const loadWeeklyData = useCallback(async () => {
    try {
      const { weekData, streak, total, average } = await loadWeeklyProgressFromStorage();
      setWeeklyProgress(weekData);
      
      const daysActive = weekData.filter(d => d > 0).length;
      const completionRate = Math.round((daysActive / 7) * 100);
      
      setStats({
        daysActive,
        total,
        average,
        completionRate,
      });
    } catch (e) {
      console.error('Error loading weekly progress', e);
    }
  }, []);

  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  const maxMinutes = Math.max(...weeklyProgress, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.chartContainer}>
          {weeklyProgress.map((minutes, index) => {
            const percentage = (minutes / maxMinutes) * 100;
            const barHeight = Math.max(5, percentage);

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${barHeight}%`,
                        backgroundColor: minutes > 0 ? COLORS_CHART.completed : COLORS_CHART.incomplete,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{DAYS[index]}</Text>
                <Text style={styles.minutesLabel}>{Math.round(minutes)}m</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.daysActive}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(stats.average)}m</Text>
          <Text style={styles.statLabel}>Avg</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completionRate}%</Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
      </View>
    </View>
  );
}
