import { View, Text, ScrollView, StatusBar, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import VideoBackground from '../components/bible/VideoBackground';
import BottomNavBar from '../components/BottomNavBar';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileStatsGrid from '../components/profile/ProfileStatsGrid';
import ProfilePlanCard from '../components/profile/ProfilePlanCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileLoadingView from '../components/profile/ProfileLoadingView';
import ProfileErrorView from '../components/profile/ProfileErrorView';
import { COLORS } from '../styles/theme';
import layoutStyles from '../styles/profile/ProfileLayout.styles';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BROWN = '#8B5D33';

export default function ProfilePage() {
  const navigation = useNavigation();
  const {
    user,
    loading,
    modalVisible,
    setModalVisible,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    updateLoading,
    journalCount,
    savedVersesCount,
    studyPlanSummary,
    weeklyProgress,
    currentStreak,
    weekTotal,
    openEditModal,
    handleSaveEdit,
    handleLogout,
  } = useProfile(navigation);


  if (loading) {
    return (
      <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
        <VideoBackground />
        <ProfileLoadingView />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
        <VideoBackground />
        <ProfileErrorView onGoBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <VideoBackground />

      {updateLoading && (
        <View style={layoutStyles.loadingOverlay}>
          <View style={layoutStyles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={layoutStyles.loadingOverlayText}>Updating profile...</Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={openEditModal}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={layoutStyles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <ProfileCard user={user} />

        {/* Stats */}
        <ProfileStatsGrid
          savedVersesCount={savedVersesCount}
          journalCount={journalCount}
          studyPlanSummary={studyPlanSummary}
        />

        {/* 7-day activity strip */}
        <View style={styles.activityCard}>
          <View style={styles.activityTop}>
            <Text style={styles.activityTitle}>This week</Text>
            {currentStreak > 0 && (
              <View style={styles.streakPill}>
                <Ionicons name="flame" size={12} color="#FF6B35" />
                <Text style={styles.streakText}>{currentStreak} day streak</Text>
              </View>
            )}
          </View>
          <View style={styles.dotsRow}>
            {DAY_LABELS.map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dot, weeklyProgress[i] > 0 && styles.dotActive]}>
                  {weeklyProgress[i] > 0 && (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  )}
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.activitySummary}>
            {weekTotal} session{weekTotal !== 1 ? 's' : ''} completed this week
          </Text>
        </View>

        {/* Reading plan */}
        <ProfilePlanCard studyPlanSummary={studyPlanSummary} />

        {/* Menu */}
        <ProfileMenu
          journalCount={journalCount}
          savedVersesCount={savedVersesCount}
          onJournal={() => navigation.navigate('Journal')}
          onSavedVerses={() => navigation.navigate('SavedVerses')}
          onPlan={() => navigation.navigate('BibleStudy')}
          onLogout={handleLogout}
        />
      </ScrollView>

      <ProfileEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        updateLoading={updateLoading}
        onSave={handleSaveEdit}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: BROWN,
    borderColor: BROWN,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAA',
  },
  activitySummary: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
  },
});
