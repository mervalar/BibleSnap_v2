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
