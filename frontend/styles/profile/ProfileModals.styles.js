import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getResponsiveDimensions } from '../bIbleStudyContent.styles';

const d = getResponsiveDimensions();

export default StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: d.spacing.lg },
  modalContent: { backgroundColor: COLORS.background, borderRadius: 16, padding: d.spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: d.spacing.lg },
  modalTitle: { fontSize: d.fontSize.title, fontWeight: '700', color: COLORS.text.primary },
  inputContainer: { marginBottom: d.spacing.md },
  inputLabel: { fontSize: d.fontSize.caption, fontWeight: '600', color: COLORS.text.secondary, marginBottom: d.spacing.xs, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: COLORS.border.light, borderRadius: 12, paddingHorizontal: d.spacing.md, paddingVertical: d.spacing.sm, fontSize: d.fontSize.body, backgroundColor: COLORS.surface },
  modalButtons: { flexDirection: 'row', marginTop: d.spacing.lg, gap: d.spacing.sm },
  modalButton: { flex: 1, paddingVertical: d.spacing.md, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  cancelButton: { backgroundColor: COLORS.surface },
  cancelButtonText: { fontSize: d.fontSize.body, fontWeight: '600', color: COLORS.text.secondary },
  saveButton: { backgroundColor: COLORS.primary },
  saveButtonText: { fontSize: d.fontSize.body, fontWeight: '600', color: COLORS.background },
  disabledButton: { opacity: 0.6 },
  progressModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  progressModalContent: { backgroundColor: COLORS.background, borderRadius: 24, width: '100%', maxWidth: 400, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  progressModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
  progressModalTitle: { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginLeft: 12 },
  progressModalCloseButton: { padding: 4 },
  progressModalBody: { padding: 20 },
  progressModalSection: { marginBottom: 24 },
  progressModalDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressModalDayTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  progressModalStatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, gap: 16 },
  progressModalStatContent: { flex: 1 },
  progressModalStatValue: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  progressModalStatLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  progressModalSectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  progressModalComparison: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, gap: 16 },
  progressModalComparisonItem: { flex: 1, alignItems: 'center' },
  progressModalComparisonDivider: { width: 1, backgroundColor: COLORS.border.light },
  progressModalComparisonLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 8 },
  progressModalComparisonValue: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  progressModalEncouragement: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 119, 66, 0.1)', padding: 16, borderRadius: 12, gap: 12, borderLeftWidth: 4, borderLeftColor: COLORS.semantic.success },
  progressModalEncouragementNeutral: { backgroundColor: 'rgba(139, 93, 51, 0.1)', borderLeftColor: COLORS.primary },
  progressModalEncouragementText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text.primary, lineHeight: 20 },
});
