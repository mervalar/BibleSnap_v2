import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BookContent from './BookContentPage';
import BottomNavBar from '../components/BottomNavBar';
import { createStyles, COLORS, getResponsiveDimensions } from '../styles/bIbleStudyContent.styles';
import JourneySummaryCard from '../components/bible/JourneySummaryCard';
import VideoBackground from '../components/bible/VideoBackground';
import CelebrationOverlay from '../components/bible/CelebrationOverlay';
import StudyContentBody from '../components/bible/StudyContentBody';
import ViewShot from 'react-native-view-shot';
import useBibleStudyContent from '../hooks/useBibleStudyContent';

const styles = createStyles();

export default function BibleStudyContent() {
  const navigation = useNavigation();
  const dimensions = getResponsiveDimensions();
  const api = useBibleStudyContent();

  const handleNextPress = () => {
    if (api.nextReading) {
      navigation.replace('BibleStudyContent', { bibleReading: api.nextReading, allReadings: api.allReadings });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <VideoBackground />
      <CelebrationOverlay visible={api.showCelebration} />
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={api.handleShare} disabled={api.isSharing}>
          <Ionicons name="share-outline" size={dimensions.iconSize.small} color={COLORS.text.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={dimensions.iconSize.large} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <StudyContentBody
        reading={api.reading}
        isChecked={api.isChecked}
        onCheckToggle={api.handleCheckToggle}
        formatBooks={api.formatBooks}
        onOpenBook={() => api.setShowBookModal(true)}
        nextReading={api.nextReading}
        onNextPress={handleNextPress}
        navigation={navigation}
        dimensions={dimensions}
        scrollViewRef={api.scrollViewRef}
        contentHeightRef={api.contentHeightRef}
        scrollYRef={api.scrollYRef}
        onScrollProgress={api.updateProgressFromScroll}
      />
      <View style={{ position: 'absolute', left: -9999, opacity: 0 }}>
        <ViewShot ref={api.shareCardRef} options={{ format: 'png', quality: 1.0 }}>
          <ImageBackground source={require('../assets/biblestudy.png')} style={styles.shareableCard} resizeMode="cover">
            <View style={styles.shareableTopSection}>
              <View style={styles.shareableHeader}>
                <Text style={styles.shareableDate}>{api.formatDate()}</Text>
                <Text style={styles.shareableDay}>Day {api.reading?.day || '1'}/{api.totalDays}</Text>
              </View>
              {api.reading?.books && <Text style={styles.shareableBooksToRead}>{api.formatBooks(api.reading.books)}</Text>}
              <Text style={styles.shareableVerseText}>{api.getVerseText()}</Text>
              <View style={styles.shareableDecorativeLine}>
                <View style={styles.shareableLine} />
                <View style={styles.shareableDots}>
                  <View style={styles.shareableDot} />
                  <View style={styles.shareableDot} />
                  <View style={styles.shareableDot} />
                </View>
              </View>
              {api.getVerseReference() && <Text style={styles.shareableReference}>{api.getVerseReference()}</Text>}
            </View>
            <View style={styles.shareableBottomSection}>
              <Text style={styles.shareableFooterText}>BibleSnap</Text>
            </View>
          </ImageBackground>
        </ViewShot>
      </View>
      <Modal visible={api.showBookModal} animationType="slide" transparent={false} onRequestClose={() => api.setShowBookModal(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => api.setShowBookModal(false)}>
            <View style={styles.modalCloseButtonInner}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {api.apiBooks.length === 0 || !api.bookInfo?.book?.id ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ fontSize: 16, color: COLORS.text.light, textAlign: 'center', marginTop: 16 }}>
                {api.apiBooks.length === 0 ? 'Loading Bible books...' : 'Preparing Bible content...'}
              </Text>
            </View>
          ) : (
            <BookContent
              route={{ params: { book: api.bookInfo.book, chapter: api.bookInfo.chapter, bibleId: api.bibleId, language: api.language } }}
              navigation={navigation}
            />
          )}
        </View>
      </Modal>
      {api.allReadings?.length > 0 && (
        <JourneySummaryCard hasPlan daysRemaining={api.planStats.daysRemaining} percent={api.planStats.percent} estimatedDate={api.planStats.estimatedDate} />
      )}
      <BottomNavBar />
    </SafeAreaView>
  );
}
