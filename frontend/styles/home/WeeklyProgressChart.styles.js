import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    marginBottom: 10,
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minHeight: 90,
    paddingHorizontal: 0,
    gap: 12,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 45,
  },
  barContainer: {
    width: 30,
    height: 70,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border.light,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 1,
  },
  minutesLabel: {
    fontSize: 8,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border.light,
    marginHorizontal: 6,
  },
});
