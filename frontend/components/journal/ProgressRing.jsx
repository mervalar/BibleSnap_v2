import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function progressColor(percent) {
  if (percent >= 100) return '#4CAF50';
  if (percent >= 50) return '#FF9800';
  if (percent > 0) return '#FF5722';
  return '#9E9E9E';
}

export default function ProgressRing({ percent, size = 56, strokeWidth = 5 }) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);
  const color = progressColor(clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.rotate}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEE" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { fontSize: size * 0.24 }]}>{clamped}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rotate: { transform: [{ rotate: '-90deg' }] },
  labelWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: '700', color: '#1A1A1A' },
});
