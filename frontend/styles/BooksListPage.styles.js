import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Responsive dimensions
const getResponsiveDimensions = () => {
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 16 : 12,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 15,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    iconSize: {
      small: isTablet ? 20 : 16,
      medium: isTablet ? 24 : 20,
      large: isTablet ? 32 : 24,
    }
  };
};

// Professional brown color palette
const COLORS = {
  primary: '#A07553',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
  },
  overlay: 'rgba(160, 117, 83, 0.1)',
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: isTablet ? 1100 : '100%',
    backgroundColor: COLORS.background,
    paddingBottom: 100, 
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.surfaceElevated,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: isTablet ? dimensions.spacing.lg : dimensions.spacing.md,
    paddingVertical: isTablet ? dimensions.spacing.lg : dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerActionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  searchContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: dimensions.spacing.sm,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border.light,
    borderRadius: 12,
    marginLeft: dimensions.spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  testamentContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    padding: dimensions.spacing.md,
  },
  testamentSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  testamentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.sm,
    borderRadius: 8,
  },
  activeTestamentButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  testamentIcon: {
    marginRight: dimensions.spacing.xs,
  },
  testamentButtonText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeTestamentButtonText: {
    color: COLORS.background,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: dimensions.spacing.sm,
  },
  statsText: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  resultsText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  booksContainer: {
    padding: isTablet ? dimensions.spacing.lg : dimensions.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? dimensions.spacing.xl * 2 : dimensions.spacing.xl * 1.5,
    paddingHorizontal: dimensions.spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    marginBottom: dimensions.spacing.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  emptyTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: dimensions.spacing.lg,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 24,
  },
  actionButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  bookCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: dimensions.cardPadding,
    marginBottom: dimensions.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bookContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookName: {
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: dimensions.spacing.sm,
  },
  languagePickerContainer: {
    width: 120,
    marginLeft: 8,
  },
});

export { styles, COLORS, dimensions };
export default styles;

