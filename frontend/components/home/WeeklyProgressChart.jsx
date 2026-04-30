import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import styles from '../../styles/home/WeeklyProgressChart.styles';
import { loadWeeklyProgressFromStorage } from '../../utils/profileStats';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LINE_COLOR = '#A07553';
const CHART_H = 80;
const PAD_H = 10;
const DOT_R = 4;

export default function WeeklyProgressChart() {
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [stats, setStats] = useState({ daysActive: 0, total: 0, average: 0, completionRate: 0 });
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 64);

  const loadWeeklyData = useCallback(async () => {
    try {
      const { weekData, total, average } = await loadWeeklyProgressFromStorage();
      setWeeklyProgress(weekData);
      const daysActive = weekData.filter((d) => d > 0).length;
      setStats({ daysActive, total, average, completionRate: Math.round((daysActive / 7) * 100) });
    } catch (e) {}
  }, []);

  useEffect(() => { loadWeeklyData(); }, [loadWeeklyData]);

  const maxVal = Math.max(...weeklyProgress, 1);
  const stepX = (chartWidth - PAD_H * 2) / 6;

  const points = weeklyProgress.map((val, i) => ({
    x: PAD_H + i * stepX,
    y: CHART_H - DOT_R - (val / maxVal) * (CHART_H - DOT_R * 2 - 10),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const fillPath = `${linePath} L${points[6].x},${CHART_H} L${points[0].x},${CHART_H} Z`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Activity</Text>
      </View>

      <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <Svg width={chartWidth} height={CHART_H + 24}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={LINE_COLOR} stopOpacity="0.3" />
              <Stop offset="1" stopColor={LINE_COLOR} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Path d={fillPath} fill="url(#grad)" />
          <Path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={DOT_R}
              fill={weeklyProgress[i] > 0 ? LINE_COLOR : '#E0D4CC'}
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}

          {points.map((p, i) =>
            weeklyProgress[i] > 0 ? (
              <SvgText key={i} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill={LINE_COLOR} fontWeight="600">
                {Math.round(weeklyProgress[i])}
              </SvgText>
            ) : null
          )}

          {points.map((p, i) => (
            <SvgText key={`d${i}`} x={p.x} y={CHART_H + 16} textAnchor="middle" fontSize="9" fill="#888" fontWeight="600">
              {DAYS[i]}
            </SvgText>
          ))}
        </Svg>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.daysActive}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(stats.average)}</Text>
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
