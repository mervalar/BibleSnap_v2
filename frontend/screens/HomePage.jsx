import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/HomePage.styles';
import { useNavigation } from '@react-navigation/native';
import AuthModal from '../components/AuthModal';
import BottomNavBar from '../components/BottomNavBar';
import HomeHeader from '../components/home/HomeHeader';
import HomeLoadingView from '../components/home/HomeLoadingView';
import VerseOfTheDayCard from '../components/home/VerseOfTheDayCard';
import QuickActions from '../components/home/QuickActions';
import WeeklyProgressChart from '../components/home/WeeklyProgressChart';
import TodayStudyCard from '../components/home/TodayStudyCard';
import useHome from '../hooks/useHome';

export default function HomePage() {
  const navigation = useNavigation();
  const api = useHome();

  if (api.authLoading) return <HomeLoadingView />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HomeHeader
        isConnected={api.isConnected}
        user={api.user}
        onProfilePress={() => navigation.navigate('Profile')}
        onLoginPress={() => api.setShowAuthModal(true)}
      />
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <VerseOfTheDayCard
          ref={api.verseCardRef}
          verse={api.verse}
          loading={api.loading}
          isSharing={api.isSharing}
          onCopyVerse={api.handleCopyVerse}
          onShareVerse={api.handleShareVerse}
        />
        <QuickActions
          onStudyPress={() => navigation.navigate('BibleStudy')}
          onJournalPress={() => api.handleAuthenticatedAction(() => navigation.navigate('Journal'))}
          onApplicationPress={() => api.handleAuthenticatedAction(() => navigation.navigate('Application'))}
        />
        <WeeklyProgressChart />
        <TodayStudyCard
          study={api.todaysStudy}
          onPress={() => api.handleAuthenticatedAction(() => navigation.navigate('BibleStudyContent', {
            bibleReading: api.todaysStudy.reading,
            allReadings: api.todaysStudy.allReadings,
          }))}
        />
      </ScrollView>
      <AuthModal
        visible={api.showAuthModal}
        onClose={() => { api.setShowAuthModal(false); api.checkUserAuth(); }}
        navigation={navigation}
        onAuthenticated={() => api.setShowAuthModal(false)}
      />
      <BottomNavBar />
    </SafeAreaView>
  );
}
