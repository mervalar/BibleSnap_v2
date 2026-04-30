import { StyleSheet } from 'react-native';
import { COLORS } from './bIbleStudyContent.styles';

export default StyleSheet.create({
  // Chapters/day top separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  separatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: 10,
  },
  separatorText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Global progress card (bottom, mirrors JourneySummaryCard style)
  progressCard: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(45,36,23,0.82)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  progressCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressCardTitle: {
    color: COLORS.text.light,
    fontSize: 14,
    fontWeight: '700',
  },
  progressCardSub: {
    color: 'rgba(247,240,227,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  pctBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pctText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
  },
  progressFill: {
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
