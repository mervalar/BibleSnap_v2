import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 14,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    iconSize: { small: isTablet ? 20 : 16, medium: isTablet ? 24 : 20, large: isTablet ? 32 : 24 },
  };
};

export const COLORS = {
  primary: '#A07553',
  primaryLight: '#B8956D',
  primaryDark: '#8A6344',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: { primary: '#1A1A1A', secondary: '#666666', tertiary: '#999999' },
  border: { light: '#E0E0E0', medium: '#CCCCCC', strong: '#B0B0B0' },
  semantic: { success: '#4CAF50', warning: '#FF9800', error: '#F44336', info: '#2196F3' },
  overlay: 'rgba(160, 117, 83, 0.1)',
};

export const CATEGORY_COLORS = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0',
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688',
];

export const createStyles = () => {
  const d = getResponsiveDimensions();
  const isTablet = screenWidth >= 768;
  const horizontalPadding = isTablet ? 24 : 16;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 80 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: d.spacing.md, color: COLORS.text.secondary, fontWeight: '500' },
    loadingOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    loadingContent: {
      backgroundColor: COLORS.surfaceElevated, padding: d.spacing.xl, borderRadius: 16,
      alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
    },
    loadingOverlayText: { marginTop: d.spacing.md, color: COLORS.text.primary, fontWeight: '500' },
    header: {
      backgroundColor: COLORS.surfaceElevated, paddingHorizontal: horizontalPadding, paddingTop: isTablet ? d.spacing.lg : d.spacing.md, paddingBottom: isTablet ? d.spacing.lg : d.spacing.md,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderBottomWidth: 1, borderBottomColor: COLORS.border.light,
    },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border.light },
    headerTitle: { fontWeight: '700', color: COLORS.text.primary, letterSpacing: -0.5 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: d.spacing.sm },
    headerActionButton: { width: 44, height: 44, backgroundColor: COLORS.surface, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.light },
    headerActionButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    addButton: { width: 44, height: 44, backgroundColor: COLORS.primary, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    searchContainer: { backgroundColor: COLORS.surfaceElevated, paddingHorizontal: horizontalPadding, paddingVertical: d.spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: d.spacing.md, paddingVertical: d.spacing.sm, borderWidth: 1, borderColor: COLORS.border.light, minHeight: 48 },
    searchInput: { flex: 1, marginLeft: d.spacing.sm, color: COLORS.text.primary, fontWeight: '400' },
    clearSearchButton: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.border.light, borderRadius: 12, marginLeft: d.spacing.sm, marginRight: d.spacing.xs },
    content: { flex: 1, backgroundColor: COLORS.surface, paddingBottom: 20 },
    filterContainer: { backgroundColor: COLORS.surfaceElevated, borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
    filterContentContainer: { paddingHorizontal: horizontalPadding, paddingVertical: isTablet ? d.spacing.lg : d.spacing.md, alignItems: 'center' },
    filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: d.spacing.md, paddingVertical: d.spacing.sm, borderRadius: 20, marginRight: d.spacing.sm, borderWidth: 1, minHeight: 36 },
    activeFilter: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    inactiveFilter: { backgroundColor: COLORS.surface, borderColor: COLORS.border.medium },
    filterText: { fontWeight: '600', letterSpacing: 0.2 },
    activeFilterText: { color: COLORS.background },
    inactiveFilterText: { color: COLORS.text.secondary },
    categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: d.spacing.xs },
    resultsInfo: { paddingHorizontal: horizontalPadding, paddingVertical: d.spacing.sm, backgroundColor: COLORS.surfaceElevated },
    resultsText: { color: COLORS.text.secondary, fontWeight: '500' },
    entriesContainer: { padding: horizontalPadding, paddingTop: d.spacing.md },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: d.spacing.xl * 2, paddingHorizontal: d.spacing.lg },
    emptyIconContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 60, marginBottom: d.spacing.lg, borderWidth: 2, borderColor: COLORS.border.light },
    emptyTitle: { fontWeight: '600', color: COLORS.text.primary, marginBottom: d.spacing.sm, textAlign: 'center' },
    emptyText: { color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: d.spacing.lg },
    clearFiltersButton: { backgroundColor: COLORS.primary, paddingHorizontal: d.spacing.lg, paddingVertical: d.spacing.sm, borderRadius: 24 },
    clearFiltersText: { color: COLORS.background, fontWeight: '600' },
    entryCard: {
      backgroundColor: COLORS.surfaceElevated, borderRadius: 12, padding: d.spacing.sm, paddingLeft: d.spacing.md, marginBottom: d.spacing.sm, borderLeftWidth: 4,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: COLORS.border.light,
    },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: d.spacing.xs },
    categoryContainer: { flexDirection: 'row', alignItems: 'center' },
    categoryIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: d.spacing.xs },
    categoryText: { fontWeight: '600', color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    entryDate: { color: COLORS.text.tertiary, fontWeight: '500' },
    entryTitle: { fontWeight: '700', color: COLORS.text.primary, marginBottom: d.spacing.xs, lineHeight: 22 },
    entryContent: { color: COLORS.text.secondary, lineHeight: 18, marginBottom: d.spacing.sm },
    entryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    verseContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DDBBA1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flex: 1, marginRight: 8 },
    verseIcon: { fontSize: 14, marginRight: 6 },
    verseText: { fontSize: 12, color: '#333', fontWeight: '500', flex: 1 },
    actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEDED2', borderRadius: 18 },
    deleteButton: { backgroundColor: '#ffebee' },
    actionButtonText: { fontSize: 16 },
  });
};

export default createStyles;
