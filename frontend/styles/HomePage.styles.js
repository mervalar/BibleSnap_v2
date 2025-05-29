import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F6F2',
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#AE796D',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  appTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  greeting: {
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
  },
  profileCircle: {
    backgroundColor: '#A07553',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#AE796D',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statLabel: {
    color: '#A07553',
    fontSize: 13,
    marginTop: 2,
  },
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  verseLabel: {
    color: '#AE796D',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  verseText: {
    color: '#222',
    fontSize: 16,
    marginBottom: 10,
  },
  verseRef: {
    color: '#A07553',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  verseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  verseAction: {
    color: '#AE796D',
    fontSize: 18,
    marginLeft: 12,
  },
  sectionTitle: {
    color: '#A07553',
    fontWeight: 'bold',
    fontSize: 15,
    marginVertical: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quickActionItem: {
    backgroundColor: '#E9D5C6',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#A07553',
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: '#AE796D',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  challengeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  challengeDesc: {
    color: '#F8F6F2',
    fontSize: 13,
    marginTop: 4,
  },
  aiCard: {
    backgroundColor: '#A07553',
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  aiTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
export default styles;