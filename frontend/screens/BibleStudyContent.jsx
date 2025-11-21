import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 64 : 48,
    fontSize: {
      title: isTablet ? 24 : 20,
      subtitle: isTablet ? 18 : 16,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    iconSize: {
      small: isTablet ? 20 : 16,
      medium: isTablet ? 24 : 20,
      large: isTablet ? 32 : 24,
    }
  };
};

const dimensions = getResponsiveDimensions();

const COLORS = {
  primary: '#8B5D33',
  primaryLight: '#A67C52',
  primaryDark: '#6A4424',
  accent: '#4A6741',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  text: {
    primary: '#2D2417',
    secondary: '#5A4A33',
    tertiary: '#8B7355',
    light: '#F7F0E3',
  },
  border: {
    light: '#E7DBC8',
    medium: '#CCBDA6',
  },
  semantic: {
    success: '#4A7742',
  },
};

// Video Background Component
const VideoBackground = () => {
  return (
    <View style={styles.videoBackground}>
      <Video
        source={require('../assets/view.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        muted
        rate={1.0}
      />
      <View style={styles.videoOverlay} />
    </View>
  );
};

const BibleStudyContent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isChecked, setIsChecked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const reading = route?.params?.bibleReading || {};
  const allReadings = route?.params?.allReadings || [];
  const viewShotRef = useRef(null);

  const handleCheckToggle = async () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    
    try {
      if (newChecked) {
        await AsyncStorage.setItem(`lesson_${reading.id}_completed`, 'true');
      } else {
        await AsyncStorage.removeItem(`lesson_${reading.id}_completed`);
      }
    } catch (error) {
      console.error('Error saving completion status:', error);
    }
  };

  const handleOpenReading = () => {
    navigation.navigate('BibleReader', {
      verse: reading?.main_verse || '',
      book: reading?.main_verse?.split(' ')[0] || '',
    });
  };

  const handleNext = () => {
    const currentIndex = allReadings.findIndex(r => r.id === reading.id);
    if (currentIndex >= 0 && currentIndex < allReadings.length - 1) {
      const nextReading = allReadings[currentIndex + 1];
      navigation.replace('BibleStudyContent', {
        bibleReading: nextReading,
        allReadings: allReadings,
      });
    }
  };

  // Format books - remove brackets and clean up
  const formatBooks = (books) => {
    if (!books) return 'No reading assigned';
    if (Array.isArray(books)) {
      return books.join(', ');
    }
    // Remove brackets if present
    return books.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        
        setIsSharing(false);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Bible Reading',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setIsSharing(false);
      Alert.alert('Error', 'Failed to share the content');
    }
  };

  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(`lesson_${reading.id}_completed`);
        setIsChecked(completed === 'true');
      } catch (error) {
        console.error('Error loading completion status:', error);
      }
    };
    
    if (reading?.id) {
      loadCompletionStatus();
    }
  }, [reading?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Video Background */}
      <VideoBackground />
      
      {/* Header Buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={dimensions.iconSize.large} color={COLORS.text.light} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={dimensions.iconSize.medium} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>

      {/* Hidden Shareable Content Card - Only rendered when sharing */}
      {isSharing && (
        <View style={styles.hiddenShareContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.shareableCard}>
            <Image
              source={require('../assets/images/img4.jpg')}
              style={styles.shareableBackground}
              resizeMode="cover"
            />
            
            {/* Overlay */}
            <View style={styles.shareableOverlay} />
            
            {/* Shareable Content */}
            <View style={styles.shareableContent}>
              {/* Top Corner - Day Number */}
              <View style={styles.flyerTopCorner}>
                <Text style={styles.flyerDayNumber}>Day</Text>
                <Text style={styles.flyerDayNumberBig}>{reading?.day || '1'}</Text>
              </View>

              {/* Other Corner - App Name */}
              <View style={styles.flyerAppCorner}>
                <Ionicons name="book" size={24} color="#FFFFFF" />
                <Text style={styles.flyerAppName}>BibleSnap</Text>
              </View>

              {/* Center Content */}
              <View style={styles.flyerCenter}>
                {/* Title */}
                <Text style={styles.flyerTitle}>{reading?.title || 'Today\'s Reading'}</Text>
                
                {/* Book Reference */}
                <View style={styles.flyerBookSection}>
                  <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.flyerBook}>{formatBooks(reading?.books)}</Text>
                </View>

                {/* Description */}
                <Text style={styles.flyerDescription}>
                  {reading?.explanation || 'Discover today\'s spiritual message'}
                </Text>
              </View>

              {/* Bottom Message */}
              <View style={styles.flyerBottom}>
                <View style={styles.flyerBottomLine} />
                <Text style={styles.flyerBottomText}>📖 Join the journey ✨</Text>
              </View>
            </View>
          </ViewShot>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Today's Verse</Text>
          <Text style={styles.dayLabel}>Day {reading?.day || '1'}</Text>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={dimensions.iconSize.medium} color={COLORS.primary} />
            <Text style={styles.cardHeaderText}>{reading?.theme || 'Daily Reading'}</Text>
          </View>
          <Text style={styles.descriptionText}>
            {reading?.explanation || 'Discover today\'s spiritual message and grow in faith through scripture study.'}
          </Text>
        </View>

        {/* Reading Card with Checkbox */}
        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <View style={styles.readingTitleContainer}>
              <Ionicons name="bookmarks" size={dimensions.iconSize.small} color={COLORS.primary} />
              <Text style={styles.readingTitle}>Today's Reading</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              onPress={handleCheckToggle}
            >
              {isChecked && (
                <Ionicons name="checkmark" size={16} color={COLORS.background} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bookToRead}>
            <TouchableOpacity style={styles.bookItem} onPress={handleOpenReading}>
              <View style={styles.bookInfo}>
                <Ionicons name="book-outline" size={dimensions.iconSize.medium} color={COLORS.primary} />
                <Text style={styles.bookText}>{formatBooks(reading?.books)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={dimensions.iconSize.medium} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Lesson Preview */}
        {reading?.next_title && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingSectionTitle}>Up Next</Text>
            <TouchableOpacity style={styles.upcomingCard} onPress={handleNext}>
              <View style={styles.upcomingContent}>
                <View style={styles.upcomingIcon}>
                  <Ionicons name="calendar-outline" size={dimensions.iconSize.medium} color={COLORS.accent} />
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingDay}>Day {(reading?.day || 0) + 1}</Text>
                  <Text style={styles.upcomingTitle} numberOfLines={2}>
                    {reading.next_title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={dimensions.iconSize.medium} color={COLORS.text.light} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Add a button to take notes */}
        <TouchableOpacity
          style={styles.noteButton}
          onPress={() => {
            navigation.navigate('Journal', {
              verse: reading?.main_verse || '',
              verseText: reading?.verse_text || reading?.explanation || '',
              category: reading?.category || null,
              fromBibleStudy: true,
            });
          }}
        >
          <Ionicons name="create-outline" size={dimensions.iconSize.medium} color={COLORS.background} />
          <Text style={styles.noteButtonText}>Take a Note</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 36, 23, 0.75)',
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: dimensions.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
    paddingBottom: dimensions.spacing.xl * 2,
  },
  // Hidden container for shareable content
  hiddenShareContainer: {
    position: 'absolute',
    left: -9999,
    top: 0,
    width: screenWidth,
  },
  shareableCard: {
    width: screenWidth,
    minHeight: 420,
    overflow: 'hidden',
    position: 'relative',
  },
  shareableBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  shareableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  shareableContent: {
    flex: 1,
    padding: 24,
    position: 'relative',
    zIndex: 2,
    minHeight: 420,
  },
  flyerTopCorner: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  flyerDayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  flyerDayNumberBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  flyerAppCorner: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  flyerAppName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  flyerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  flyerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  flyerBookSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(160, 117, 83, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  flyerBook: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  flyerDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  flyerBottom: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flyerBottomLine: {
    width: 80,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    marginBottom: 10,
  },
  flyerBottomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: dimensions.spacing.xl,
  },
  mainTitle: {
    fontSize: dimensions.fontSize.title * 1.4,
    fontWeight: '800',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.sm,
    letterSpacing: 1,
  },
  dayLabel: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.light,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 20,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  cardHeaderText: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: dimensions.spacing.sm,
  },
  descriptionText: {
    fontSize: dimensions.fontSize.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  readingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    marginBottom: dimensions.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
    paddingBottom: dimensions.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  readingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: dimensions.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.semantic.success,
    borderColor: COLORS.semantic.success,
  },
  bookToRead: {
    marginBottom: dimensions.spacing.lg,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: dimensions.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: dimensions.spacing.sm,
  },
  bookText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  upcomingSection: {
    marginTop: dimensions.spacing.sm,
  },
  upcomingSectionTitle: {
    fontSize: dimensions.fontSize.subtitle,
    fontWeight: '700',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.md,
  },
  upcomingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.md,
  },
  upcomingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dimensions.spacing.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingDay: {
    fontSize: dimensions.fontSize.caption,
    fontWeight: '600',
    color: COLORS.text.light,
    marginBottom: dimensions.spacing.xs,
  },
  upcomingTitle: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  noteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.lg,
    borderRadius: 12,
    marginTop: dimensions.spacing.lg,
    gap: dimensions.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  noteButtonText: {
    fontSize: dimensions.fontSize.body,
    fontWeight: '700',
    color: COLORS.background,
  },
});

export default BibleStudyContent;