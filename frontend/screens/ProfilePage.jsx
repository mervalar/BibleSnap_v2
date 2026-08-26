import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, ActivityIndicator, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import BottomNavBar from '../components/BottomNavBar';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileStatsGrid from '../components/profile/ProfileStatsGrid';
import ProfilePlanCard from '../components/profile/ProfilePlanCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileLoadingView from '../components/profile/ProfileLoadingView';
import ProfileErrorView from '../components/profile/ProfileErrorView';
import ProfileActivityGraph from '../components/profile/ProfileActivityGraph';
import ReminderModal from '../components/ReminderModal';
import { getSavedReminder, getSavedJournalReminder } from '../utils/notificationService';
import { COLORS } from '../styles/theme';
import layoutStyles from '../styles/profile/ProfileLayout.styles';


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
    openEditModal,
    handleSaveEdit,
    handleLogout,
    handleDeleteAccount,
  } = useProfile(navigation);

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [journalReminder, setJournalReminder] = useState(null);

  useEffect(() => {
    getSavedReminder().then((r) => { if (r) setReminder(r); });
    getSavedJournalReminder().then((r) => { if (r) setJournalReminder(r); });
  }, []);


  if (loading) {
    return (
      <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
        <ImageBackground source={require('../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <ProfileLoadingView />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
        <ImageBackground source={require('../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <ProfileErrorView onGoBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layoutStyles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={require('../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

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
          <Ionicons name="arrow-back" size={20} color="#6A4424" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={openEditModal}>
          <Ionicons name="create-outline" size={20} color="#6A4424" />
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

        {/* Activity heatmap */}
        <ProfileActivityGraph />

        {/* Reading plan */}
        <ProfilePlanCard studyPlanSummary={studyPlanSummary} />

        {/* Menu */}
        <ProfileMenu
          journalCount={journalCount}
          savedVersesCount={savedVersesCount}
          onJournal={() => navigation.navigate('Journal')}
          onSavedVerses={() => navigation.navigate('SavedVerses')}
          onWishlist={() => navigation.navigate('Wishlist')}
          onPlan={() => navigation.navigate('BibleStudy')}
          onLogout={handleLogout}
          onReminderPress={() => setShowReminderModal(true)}
          onDeleteAccount={handleDeleteAccount}
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

      <ReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        currentReminder={reminder}
        onReminderChange={setReminder}
        currentJournalReminder={journalReminder}
        onJournalReminderChange={setJournalReminder}
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6A4424',
    letterSpacing: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
});
