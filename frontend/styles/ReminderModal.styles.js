import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './bIbleStudyContent.styles';

const { width: W } = Dimensions.get('window');

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 6,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { color: COLORS.text.primary, fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.text.tertiary, fontSize: 13, marginBottom: 20 },

  // AM / PM toggle
  ampmRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  ampmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  ampmBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(139,93,51,0.1)' },
  ampmText: { color: COLORS.text.tertiary, fontSize: 15, fontWeight: '700' },
  ampmTextActive: { color: COLORS.primary },

  // Section labels
  sectionLabel: { color: COLORS.text.secondary, fontSize: 12, fontWeight: '700', marginBottom: 10, letterSpacing: 0.8, textTransform: 'uppercase' },

  // Hour grid
  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  hourChip: {
    width: (W - 40 - 48 - 32) / 6 - 2,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  hourChipActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(139,93,51,0.1)' },
  hourText: { color: COLORS.text.tertiary, fontSize: 14, fontWeight: '600' },
  hourTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Minute row
  minuteRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  minuteChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  minuteChipActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(139,93,51,0.1)' },
  minuteText: { color: COLORS.text.tertiary, fontSize: 14, fontWeight: '600' },
  minuteTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Preview
  preview: {
    backgroundColor: 'rgba(139,93,51,0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.2)',
  },
  previewTime: { color: COLORS.primary, fontSize: 28, fontWeight: '800' },
  previewLabel: { color: COLORS.text.tertiary, fontSize: 12, marginTop: 2 },

  // Buttons
  setBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  setBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  removeBtnText: { color: COLORS.semantic.error, fontSize: 14, fontWeight: '600' },
});
