import React from 'react';
import { View, ScrollView } from 'react-native';
import styles from '../styles/HomePage.styles';
import { useNavigation } from '@react-navigation/native';
import AuthModal from '../components/AuthModal';
import HomeHeader from '../components/home/HomeHeader';
import HomeLoadingView from '../components/home/HomeLoadingView';
import VerseOfTheDayCard from '../components/home/VerseOfTheDayCard';
import QuickActions from '../components/home/QuickActions';
import WeeklyProgressChart from '../components/home/WeeklyProgressChart';
import JourneySummaryCard from '../components/bible/JourneySummaryCard';
import TodayApplicationCard from '../components/home/TodayApplicationCard';
import useHome from '../hooks/useHome';

export default function HomePage() {
  const navigation = useNavigation();
  const api = useHome();

  if (api.authLoading) return <HomeLoadingView />;

  return (
    <View style={styles.container}>
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
          onReadBible={() => navigation.navigate('BooksList')}
          onJournalPress={() => api.handleAuthenticatedAction(() => navigation.navigate('Journal'))}
          onBibleStudyPress={() => navigation.navigate('BibleStudy')}
        />
        <TodayApplicationCard
          note={api.todayApplication}
          onPress={() => api.handleAuthenticatedAction(() => navigation.navigate('Journal'))}
        />
        <WeeklyProgressChart />
        {api.isConnected && api.journeyStats.hasPlan && (
          <JourneySummaryCard
            variant="home"
            title="Your Journey"
            hasPlan={api.journeyStats.hasPlan}
            daysRemaining={api.journeyStats.daysRemaining}
            percent={api.journeyStats.percent}
            estimatedDate={api.journeyStats.estimatedDate}
            onPress={() => navigation.navigate('BibleStudy')}
          />
        )}
      </ScrollView>
      <AuthModal
        visible={api.showAuthModal}
        onClose={() => { api.setShowAuthModal(false); api.checkUserAuth(); }}
        navigation={navigation}
        onAuthenticated={() => api.setShowAuthModal(false)}
      />
    </View>
  );
}
