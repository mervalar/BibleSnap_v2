import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStyles } from '../../styles/bIbleStudyContent.styles';
import { COLORS } from '../../styles/theme';

const overlayStyles = createStyles();

/** Readable on cream/light home background (overlay styles are for dark video UI). */
const homeStyles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginTop: 20,
    marginBottom: 8,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    shadowColor: '#2D2417',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  planSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planInfoLeft: { flex: 1 },
  planTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    fontSize: 15,
    marginBottom: 4,
  },
  planSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  planStatsRight: { alignItems: 'flex-end' },
  planPercentBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  planPercentText: { fontWeight: '700', color: '#FFF', fontSize: 14 },
  planProgressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});

const JourneySummaryCard = ({
  title = 'Your Journey',
  hasPlan = true,
  daysRemaining,
  percent = 0,
  estimatedDate,
  startMessageIfNoPlan = false,
  onPress,
  /** `'overlay'` = translucent on video; `'home'` = solid card for light backgrounds */
  variant = 'overlay',
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent || 0));
  const isHome = variant === 'home';

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
    <View style={isHome ? homeStyles.card : overlayStyles.planSummaryBottom}>
      <View style={isHome ? homeStyles.planSummaryContent : overlayStyles.planSummaryContent}>
        <View style={isHome ? homeStyles.planInfoLeft : overlayStyles.planInfoLeft}>
          <Text style={isHome ? homeStyles.planTitle : overlayStyles.planTitle}>{title}</Text>
          {subtitleText ? (
            <Text style={isHome ? homeStyles.planSubtitle : overlayStyles.planSubtitle}>{subtitleText}</Text>
          ) : null}
        </View>
        <View style={isHome ? homeStyles.planStatsRight : overlayStyles.planStatsRight}>
          <View style={isHome ? homeStyles.planPercentBadge : overlayStyles.planPercentBadge}>
            <Text style={isHome ? homeStyles.planPercentText : overlayStyles.planPercentText}>{clampedPercent}%</Text>
          </View>
        </View>
      </View>
      <View style={isHome ? homeStyles.planProgressBar : overlayStyles.planProgressBar}>
        <View
          style={[
            isHome ? homeStyles.planProgressFill : overlayStyles.planProgressFill,
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

