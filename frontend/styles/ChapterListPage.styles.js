import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 80 : 60,
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
    backgroundColor: COLORS.background,
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
    paddingHorizontal: dimensions.spacing.md,
    paddingTop: dimensions.spacing.md,
    paddingBottom: dimensions.spacing.md,
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: dimensions.spacing.md,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  bookInfoContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    padding: dimensions.spacing.md,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: dimensions.spacing.md,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    marginBottom: dimensions.spacing.xs,
  },
  bookSubtitle: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chaptersContainer: {
    padding: dimensions.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xl * 2,
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
  chaptersList: {
  },
  chapterCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: dimensions.spacing.sm,
    width: '100%',
    minHeight: 50,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: dimensions.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chapterText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  chapterArrow: {
    marginLeft: dimensions.spacing.sm,
  },
});

export { styles, COLORS, dimensions };
export default styles;

