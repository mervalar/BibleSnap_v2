import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useProfile from '../hooks/useProfile';
import VideoBackground from '../components/bible/VideoBackground';
import BottomNavBar from '../components/BottomNavBar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileStatsGrid from '../components/profile/ProfileStatsGrid';
import ProfileWeeklyChart from '../components/profile/ProfileWeeklyChart';
import ProfilePlanCard from '../components/profile/ProfilePlanCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileProgressModal from '../components/profile/ProfileProgressModal';
import ProfileLoadingView from '../components/profile/ProfileLoadingView';
import ProfileErrorView from '../components/profile/ProfileErrorView';
import { COLORS } from '../styles/theme';
import styles from '../styles/profile';

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
    weekAverage,
    chartInsight,
    showProgressModal,
    setShowProgressModal,
    selectedDayData,
    openEditModal,
    handleSaveEdit,
    handleLogout,
    openDayDetail,
  } = useProfile(navigation);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <VideoBackground />
        <ProfileLoadingView />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <VideoBackground />
        <ProfileErrorView onGoBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <VideoBackground />

      {updateLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingOverlayText}>Updating profile...</Text>
          </View>
        </View>
      )}

      <ProfileHeader onBack={() => navigation.goBack()} onEdit={openEditModal} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard user={user} />
        <ProfileStatsGrid
          savedVersesCount={savedVersesCount}
          journalCount={journalCount}
          studyPlanSummary={studyPlanSummary}
        />
        <ProfileWeeklyChart
          weeklyProgress={weeklyProgress}
          weekTotal={weekTotal}
          weekAverage={weekAverage}
          currentStreak={currentStreak}
          chartInsight={chartInsight}
          selectedDayIndex={selectedDayData?.index ?? null}
          onDayPress={openDayDetail}
        />
        <ProfilePlanCard studyPlanSummary={studyPlanSummary} />
        <ProfileMenu
          journalCount={journalCount}
          onJournal={() => navigation.navigate('Journal')}
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

      <ProfileProgressModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        selectedDayData={selectedDayData}
        weekAverage={weekAverage}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}
