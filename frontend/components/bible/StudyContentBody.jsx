import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function StudyContentBody({
  reading,
  isChecked,
  onCheckToggle,
  formatBooks,
  onOpenBook,
  nextReading,
  onNextPress,
  onTakeNote,
  navigation,
  dimensions,
  scrollViewRef,
  contentHeightRef,
  scrollYRef,
  onScrollProgress,
}) {
  const dims = dimensions || getResponsiveDimensions();
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={(e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        scrollYRef.current = contentOffset.y;
        contentHeightRef.current = contentSize.height;
        onScrollProgress(contentSize.height, contentOffset.y, layoutMeasurement.height);
      }}
      scrollEventThrottle={100}
      onContentSizeChange={(_, h) => { contentHeightRef.current = h; }}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (contentHeightRef.current > 0) onScrollProgress(contentHeightRef.current, scrollYRef.current, h);
      }}
    >
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Today's Verse</Text>
        <Text style={styles.dayLabel}>Lesson {reading?.day || '1'}</Text>
      </View>
      <View style={styles.descriptionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={dims.iconSize.medium} color={COLORS.primary} />
          <Text style={styles.cardHeaderText}>{reading?.theme || 'Daily Reading'}</Text>
        </View>
        <Text style={styles.descriptionText}>
          {reading?.explanation || "Discover today's spiritual message and grow in faith through scripture study."}
        </Text>
      </View>
      <View style={styles.readingCard}>
        <View style={styles.readingHeader}>
          <View style={styles.readingTitleContainer}>
            <Ionicons name="bookmarks" size={dims.iconSize.small} color={COLORS.primary} />
            <Text style={styles.readingTitle}>Today's Reading</Text>
          </View>
          <TouchableOpacity style={[styles.checkbox, isChecked && styles.checkboxChecked]} onPress={onCheckToggle}>
            {isChecked && <Ionicons name="checkmark" size={16} color={COLORS.background} />}
          </TouchableOpacity>
        </View>
        <View style={styles.bookToRead}>
          <TouchableOpacity style={styles.bookItem} onPress={onOpenBook}>
            <View style={styles.bookInfo}>
              <Ionicons name="book-outline" size={dims.iconSize.medium} color={COLORS.primary} />
              <Text style={styles.bookText}>{formatBooks(reading?.books)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={dims.iconSize.medium} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      {reading?.next_title && (
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingSectionTitle}>Up Next</Text>
          <TouchableOpacity style={styles.upcomingCard} onPress={onNextPress}>
            <View style={styles.upcomingContent}>
              <View style={styles.upcomingIcon}>
                <Ionicons name="calendar-outline" size={dims.iconSize.medium} color={COLORS.accent} />
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingDay}>Lesson {(reading?.day || 0) + 1}</Text>
                <Text style={styles.upcomingTitle} numberOfLines={2}>{reading.next_title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={dims.iconSize.medium} color={COLORS.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.noteButton} onPress={() => navigation.navigate('Journal', { verse: reading?.main_verse || '', verseText: reading?.verse_text || reading?.explanation || '', category: reading?.category || null, fromBibleStudy: true })}>
        <Ionicons name="create-outline" size={dims.iconSize.medium} color={COLORS.background} />
        <Text style={styles.noteButtonText}>Take a Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
