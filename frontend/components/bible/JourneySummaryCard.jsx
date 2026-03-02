import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

const JourneySummaryCard = ({
  title = 'Your Journey',
  hasPlan = true,
  daysRemaining,
  percent = 0,
  estimatedDate,
  startMessageIfNoPlan = false,
  onPress,
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent || 0));

  let subtitleText = null;

  if (!hasPlan && startMessageIfNoPlan) {
    subtitleText = 'Start your journey.. !!';
  } else if (hasPlan) {
    if (typeof daysRemaining === 'number') {
      subtitleText = `${daysRemaining}d remaining`;
      if (estimatedDate) {
        const dateObj =
          estimatedDate instanceof Date ? estimatedDate : new Date(estimatedDate);
        if (!isNaN(dateObj.getTime())) {
          subtitleText += ` • Est. ${dateObj.toLocaleDateString()}`;
        }
      }
    }
  }

  const content = (
    <View style={styles.planSummaryBottom}>
      <View style={styles.planSummaryContent}>
        <View style={styles.planInfoLeft}>
          <Text style={styles.planTitle}>{title}</Text>
          {subtitleText ? (
            <Text style={styles.planSubtitle}>{subtitleText}</Text>
          ) : null}
        </View>
        <View style={styles.planStatsRight}>
          <View style={styles.planPercentBadge}>
            <Text style={styles.planPercentText}>{clampedPercent}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.planProgressBar}>
        <View
          style={[
            styles.planProgressFill,
            { width: `${clampedPercent}%` },
          ]}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default JourneySummaryCard;

