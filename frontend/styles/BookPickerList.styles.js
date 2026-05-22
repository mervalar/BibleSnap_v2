import { StyleSheet } from 'react-native';
import { COLORS } from './bIbleStudyContent.styles';

export default StyleSheet.create({
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

  progressCard: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 248, 240, 0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 93, 51, 0.25)',
  },
  progressCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCardTitle: {
    fontWeight: '700',
    color: '#6A4424',
    fontSize: 14,
    marginBottom: 2,
  },
  progressCardSub: {
    color: COLORS.text.secondary,
    fontSize: 11,
  },
  pctBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pctText: {
    fontWeight: '700',
    color: '#FFF',
    fontSize: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(139, 93, 51, 0.12)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
});
