import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getResponsiveDimensions } from '../bIbleStudyContent.styles';

const d = getResponsiveDimensions();

export default StyleSheet.create({
  planCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, padding: d.spacing.lg, marginBottom: d.spacing.lg },
  planTitle: { fontSize: d.fontSize.subtitle, fontWeight: '700', color: COLORS.text.primary },
  planSubtitle: { fontSize: d.fontSize.caption, color: COLORS.text.secondary, marginTop: 4 },
  planStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: d.spacing.md },
  planStatLabel: { fontSize: d.fontSize.caption, color: COLORS.text.secondary },
  planStatValue: { fontSize: d.fontSize.subtitle, fontWeight: '700', color: COLORS.text.primary, marginTop: 4 },
  planStatRight: { alignItems: 'flex-end' },
  encouragementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 12, padding: 12, marginTop: d.spacing.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  encouragementCardSad: { backgroundColor: 'rgba(255, 235, 235, 0.7)', borderLeftColor: COLORS.semantic.error },
  encouragementCardHappy: { backgroundColor: 'rgba(235, 255, 235, 0.7)', borderLeftColor: COLORS.semantic.success },
  encouragementCardEmoji: { fontSize: 24, marginRight: 12 },
  encouragementCardText: { flex: 1, fontSize: d.fontSize.caption, color: COLORS.text.primary, fontWeight: '600', lineHeight: 18 },
  progressBar: { height: 8, backgroundColor: COLORS.surface, borderRadius: 4, marginTop: d.spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  planFinishText: { fontSize: d.fontSize.caption, color: COLORS.text.secondary, marginTop: d.spacing.sm },
});
