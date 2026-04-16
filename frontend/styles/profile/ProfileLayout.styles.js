import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getResponsiveDimensions } from '../bIbleStudyContent.styles';

const d = getResponsiveDimensions();

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  videoBackground: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(68, 57, 46, 0.74)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: d.spacing.lg },
  loadingText: { marginTop: d.spacing.md, color: COLORS.text.light, fontSize: d.fontSize.body, fontWeight: '500' },
  errorTitle: { fontSize: d.fontSize.title, fontWeight: '700', color: COLORS.text.light, marginTop: d.spacing.md, marginBottom: d.spacing.sm },
  errorText: { fontSize: d.fontSize.body, color: COLORS.text.light, textAlign: 'center', marginBottom: d.spacing.lg },
  backButton: { backgroundColor: COLORS.background, paddingHorizontal: d.spacing.lg, paddingVertical: d.spacing.md, borderRadius: 12 },
  backButtonText: { color: COLORS.primary, fontSize: d.fontSize.body, fontWeight: '600' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingContent: { backgroundColor: COLORS.background, padding: d.spacing.xl, borderRadius: 16, alignItems: 'center' },
  loadingOverlayText: { marginTop: d.spacing.md, color: COLORS.text.primary, fontSize: d.fontSize.body, fontWeight: '500' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: d.spacing.md, paddingTop: d.spacing.lg, paddingBottom: d.spacing.lg },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: d.fontSize.title, fontWeight: '700', color: COLORS.text.light, letterSpacing: 0.5 },
  content: { flex: 1 },
  contentContainer: { padding: d.spacing.lg, paddingBottom: 120 },
});
