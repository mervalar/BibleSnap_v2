import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';
import { createStyles, COLORS, getResponsiveDimensions } from '../styles/bIbleStudyContent.styles';
import BottomNavBar from '../components/BottomNavBar';
import StudyPlanModal from '../components/StudyPlanModal';
import TypeFilterModal from '../components/TypeFilterModal';
import UnlockModal from '../components/UnlockModal';
import AuthModal from '../components/AuthModal';
import JourneySummaryCard from '../components/bible/JourneySummaryCard';
import VideoBackground from '../components/bible/VideoBackground';
import VerticalGameMap from '../components/bible/VerticalGameMap';
import EncouragementBanner from '../components/bible/EncouragementBanner';
import BibleStudyHeader from '../components/bible/BibleStudyHeader';
import BibleStudySearchBar from '../components/bible/BibleStudySearchBar';
import BibleStudyFilterBar from '../components/bible/BibleStudyFilterBar';
import BibleStudyEmptyState from '../components/bible/BibleStudyEmptyState';
import useBibleStudyAuth from '../hooks/useBibleStudyAuth';
import useBibleStudyData from '../hooks/useBibleStudyData';
import useBibleStudyPlan from '../hooks/useBibleStudyPlan';
// import { getBookIdFromName } from '../utils/bibleStudyUtils'; // TEMP: Pick a book disabled

const styles = createStyles();

export default function BibleStudyPage() {
  const navigation = useNavigation();
  const dimensions = getResponsiveDimensions();
  const auth = useBibleStudyAuth();
  const data = useBibleStudyData(auth.isAuthenticated);
  const plan = useBibleStudyPlan(data);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [typeFilterModalVisible, setTypeFilterModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('historical');
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      data.refreshCompleted?.();
      auth.checkAuth();
    }, [data.refreshCompleted, auth.checkAuth])
  );

  // TEMP: Pick a book disabled
  // const transformedBooks = (data.books || []).map((book) => ({ ...book, title: book.name, id: `book_${book.id}` }));
  // const filteredBooks = transformedBooks.filter(
  //   (book) => !searchQuery || (book.name && book.name.toLowerCase().includes(searchQuery.toLowerCase()))
  // );
  const filteredReadings = (data.bibleReadings || []).filter((item) => {
    const matchType =
      selectedType === 'historical' ||
      (selectedType !== 'pickupbook' &&
        ((item.type && item.type.toLowerCase() === selectedType.toLowerCase()) ||
          (item.category?.name && item.category.name.toLowerCase().includes(selectedType.toLowerCase()))));
    const matchSearch =
      !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.main_verse && item.main_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });
  const displayItems = filteredReadings;

  const handleNavigateToStudy = (study, progress) => {
    navigation.navigate('BibleStudyContent', {
      bibleReading: study,
      allReadings: filteredReadings,
      progress,
      onProgressUpdate: (percent) => data.setProgressMap((prev) => ({ ...prev, [study.id]: percent })),
    });
  };

  // TEMP: Pick a book disabled
  // const handleNavigateToBook = async (book) => {
  //   try {
  //     const savedLanguage = (await AsyncStorage.getItem('selectedLanguage')) || 'english';
  //     const savedBibleId = (await AsyncStorage.getItem('selectedBibleId')) || '65eec8e0b60e656b-01';
  //     navigation.navigate('BookContent', {
  //       book: { id: getBookIdFromName(book.name), name: book.name },
  //       chapter: { number: '1' },
  //       bibleId: savedBibleId,
  //       language: savedLanguage,
  //     });
  //   } catch (error) {
  //     console.error('Error navigating to book:', error);
  //   }
  // };

  const onPressItem = handleNavigateToStudy;
  const handleAuthClose = () => {
    auth.setShowAuthModal(false);
    AsyncStorage.getItem('isAuthenticated').then((isAuth) => {
      if (isAuth === 'true') auth.checkAuth();
      else navigation.goBack();
    });
  };

  if (auth.authLoading) {
    return <SplashScreen onFinish={() => {}} duration={1000} />;
  }
  if (!auth.isAuthenticated) {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <VideoBackground />
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingOverlayText}>Please sign up or log in to access Bible Studies</Text>
            </View>
          </View>
        </SafeAreaView>
        <AuthModal
          visible={auth.showAuthModal}
          onClose={() => {
            auth.setShowAuthModal(false);
            AsyncStorage.getItem('isAuthenticated').then((isAuth) => {
              if (isAuth === 'true') auth.checkAuth();
              else navigation.goBack();
            });
          }}
          navigation={navigation}
        />
      </>
    );
  }
  if (data.loading && !data.bibleReadings?.length) {
    return <SplashScreen onFinish={() => {}} duration={2000} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <VideoBackground />
      <EncouragementBanner message={plan.encouragementMessage} onDismiss={() => plan.setEncouragementMessage(null)} />
      {data.loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>Loading journey...</Text>
          </View>
        </View>
      )}
      <BibleStudyHeader onBack={() => navigation.goBack()} showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} dimensions={dimensions} />
      <BibleStudySearchBar visible={showSearch} searchQuery={searchQuery} onChangeQuery={setSearchQuery} dimensions={dimensions} />
      <BibleStudyFilterBar selectedType={selectedType} onTypePress={() => setTypeFilterModalVisible(true)} studyPlan={data.studyPlan} onPlanPress={() => plan.setPlanModalVisible(true)} />
      <View style={styles.mainContent}>
        {displayItems.length === 0 ? (
          <BibleStudyEmptyState selectedType={selectedType} dimensions={dimensions} />
        ) : (
          <>
            {data.studyPlan && data.studyPlan.days !== 365 && selectedType !== 'pickupbook' && (
              <View style={styles.lessonsPerDaySeparator}>
                <View style={styles.separatorLine} />
                <View style={styles.lessonsPerDayContainer}>
                  <Ionicons name="calendar" size={16} color={COLORS.accent} />
                  <Text style={styles.lessonsPerDayText}>
                    {Math.ceil((data.bibleReadings?.length || 0) / data.studyPlan.days)} lessons per day
                  </Text>
                </View>
                <View style={styles.separatorLine} />
              </View>
            )}
            <VerticalGameMap
              items={displayItems}
              progressMap={data.progressMap}
              completedSet={data.completedStudies}
              onPressItem={onPressItem}
              onRequestUnlock={() => setUnlockModalVisible(true)}
              todaysReadingIds={plan.todaysReadingIds}
            />
            {data.studyPlan && (
              <View style={styles.journeyCardContainer}>
                <JourneySummaryCard 
                  hasPlan 
                  daysRemaining={plan.planStats.daysRemaining} 
                  percent={plan.planStats.percent}
                  estimatedDate={plan.planStats.estimatedDate}
                />
              </View>
            )}
          </>
        )}
      </View>
      <StudyPlanModal visible={plan.planModalVisible} onClose={() => plan.setPlanModalVisible(false)} planDays={plan.planDays} startDate={data.startDate} onSavePlan={plan.savePlan} bibleReadingsCount={data.bibleReadings?.length || 365} />
      <TypeFilterModal visible={typeFilterModalVisible} onClose={() => setTypeFilterModalVisible(false)} selectedType={selectedType} onSelectType={(t) => { setSelectedType(t); setTypeFilterModalVisible(false); }} />
      <UnlockModal visible={unlockModalVisible} onClose={() => setUnlockModalVisible(false)} />
      <AuthModal visible={auth.showAuthModal} onClose={handleAuthClose} navigation={navigation} />
      <BottomNavBar />
    </SafeAreaView>
  );
}
