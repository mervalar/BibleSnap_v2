import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    color: '#2D2417',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#9B8870',
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'center',
  },
});
