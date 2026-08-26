import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const COLORS = {
  primary: '#A07553',
  border: 'rgba(160, 117, 83, 0.2)',
  overlay: 'rgba(255, 255, 255, 0.85)',
  headerBg: 'rgba(255, 255, 255, 0.9)',
  headerBorder: 'rgba(224, 224, 224, 0.5)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  text: '#333',
  textMuted: '#999',
};

export const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, width: '100%', backgroundColor: COLORS.overlay },
    backgroundImage: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
    },
    contentOverlay: { flex: 1, backgroundColor: COLORS.overlay, zIndex: 2 },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
      paddingBottom: 10,
      backgroundColor: COLORS.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.headerBorder,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    groupButton: { padding: 8 },
    listContainer: { padding: 16, paddingBottom: Platform.OS === 'android' ? 140 : 100 },
    bookSection: { marginBottom: 24 },
    bookHeader: {
      fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12,
      paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    verseCard: {
      backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 16, marginBottom: 12,
      position: 'relative', overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    verseReference: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
    deleteButton: { padding: 4 },
    verseText: { fontSize: 15, lineHeight: 22, color: COLORS.text },
    colorStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: COLORS.primary },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: 80 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
    filterSection: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    filterTitle: { fontWeight: 'bold', color: COLORS.primary, fontSize: 16 },
    filterRow: { marginTop: 8 },
    filterChip: { padding: 8, borderRadius: 16, marginRight: 8 },
    filterChipActive: { backgroundColor: COLORS.primary },
    filterChipInactive: { backgroundColor: '#eee' },
    filterChipText: { color: COLORS.primary },
    filterChipTextActive: { color: '#fff' },
  });

export default createStyles;
