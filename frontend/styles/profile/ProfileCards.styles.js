import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getResponsiveDimensions } from '../bIbleStudyContent.styles';

const d = getResponsiveDimensions();

export default StyleSheet.create({
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: d.spacing.lg,
    alignItems: 'center',
    marginBottom: d.spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: d.spacing.md,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: d.fontSize.title * 1.5,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.semantic.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileName: {
    fontSize: d.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: d.spacing.xs,
  },
  profileEmail: {
    fontSize: d.fontSize.body,
    color: COLORS.text.secondary,
    marginBottom: d.spacing.sm,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: d.spacing.sm,
    paddingVertical: d.spacing.xs,
    borderRadius: 12,
  },
  joinedText: {
    marginLeft: d.spacing.xs,
    fontSize: d.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: d.spacing.sm,
    marginBottom: d.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: d.spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: d.fontSize.title,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginVertical: d.spacing.xs,
  },
  statLabel: {
    fontSize: d.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: d.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: d.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: d.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  menuSubtext: {
    fontSize: d.fontSize.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginLeft: 70,
  },
});
