import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEDED2',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#A07553',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    backgroundColor: '#A07553',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  connectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIcon: {
    padding: 6,
  },
  bellText: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  loginButton: {
    backgroundColor: '#A07553',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  verseCard: {
    borderRadius: 20,
    marginBottom: 20,
    minHeight: 420,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay for text readability
  },
  verseContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 18,
  },
  iconButtonRow: {
    backgroundColor: 'rgba(160,117,83,0.85)',
    borderRadius: 22,
    padding: 10,
    marginHorizontal: 6,
    elevation: 2,
  },
  verseLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  verseDate: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verseLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseLoadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
  },
  verseTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  verseText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseRefContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseRef: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseDecorator: {
    marginLeft: 8,
  },
  verseDecoratorText: {
    fontSize: 16,
    color: '#fff',
  },
  verseErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseErrorSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  actionText: {
    color: '#9E795D',
    fontWeight: '600',
    fontSize: 11,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerCard: {
    backgroundColor: '#9E795D',
  },
  studyCard: {
    backgroundColor: '#A07553',
  },
  assistantCard: {
    backgroundColor: '#9E795D',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#EEDED2',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: '#DDBBA1',
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeCardCompleted: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4A7742',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#A07553',
    top: -100,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  challengeTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14, // Reduced from 16
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 119, 66, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedBadgeText: {
    color: '#4A7742',
    fontSize: 11,
    fontWeight: '700',
  },
  challengeBadge: {
    backgroundColor: '#A07553',
    paddingHorizontal: 8, // Reduced from 10
    paddingVertical: 3, // Reduced from 4
    borderRadius: 10, // Reduced from 12
  },
  challengeBadgeText: {
    color: '#fff',
    fontSize: 10, // Reduced from 11
    fontWeight: '600',
  },
  challengeLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  challengeLoadingText: {
    marginLeft: 8,
    color: '#9E795D',
    fontSize: 11, // Reduced from 12
  },
  challengeDesc: {
    color: '#9E795D',
    fontSize: 13, // Reduced from 14
    marginBottom: 8, // Reduced from 12
    lineHeight: 18, // Reduced from 20
  },
  challengeDescCompleted: {
    color: '#4A7742',
    fontWeight: '600',
  },
  challengeVerse: {
    color: '#9E795D',
    fontSize: 10, // Reduced from 11
    fontStyle: 'italic',
    marginBottom: 12, // Reduced from 16
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Reduced from 12
    marginTop: 'auto',
  },
  progressBar: {
    flex: 1,
    height: 6, // Reduced from 8
    backgroundColor: '#EEDED2',
    borderRadius: 3, 
    overflow: 'hidden',
  },
  progressBarCompleted: {
    borderColor: '#4A7742',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#A07553',
    borderRadius: 3, 
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    color: '#9E795D',
    fontWeight: 'bold',
    fontSize: 11, // Reduced from 12
  },
  progressTextCompleted: {
    color: '#4A7742',
    fontWeight: '700',
  },
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  progressModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEDED2',
  },
  progressModalTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#2D2417',
    marginLeft: 12,
  },
  progressModalCloseButton: {
    padding: 4,
  },
  progressModalBody: {
    padding: 20,
  },
  progressModalSection: {
    marginBottom: 24,
  },
  progressModalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A07553',
    marginBottom: 12,
  },
  progressModalChallengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2417',
    marginBottom: 8,
    lineHeight: 26,
  },
  progressModalCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEDED2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressModalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A07553',
  },
  progressModalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  progressModalStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressModalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2417',
  },
  progressModalProgressContainer: {
    marginTop: 12,
  },
  progressModalProgressBar: {
    height: 12,
    backgroundColor: '#EEDED2',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressModalProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressModalProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E795D',
    textAlign: 'center',
  },
  progressModalVerseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  progressModalVerseText: {
    flex: 1,
    fontSize: 15,
    color: '#5A4A33',
    fontStyle: 'italic',
  },
  progressModalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A07553',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  progressModalActionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
