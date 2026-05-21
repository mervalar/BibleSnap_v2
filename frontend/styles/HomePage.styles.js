import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

export default StyleSheet.create({
  container: {
    backgroundColor: '#EEDED2',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primaryLight,
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    justifyContent: 'flex-start',
  },
});
