import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import CustomPicker from '../CustomPicker';
import SplashScreen from '../SplashScreen';
import BottomNavBar from '../BottomNavBar';
import HighlightToolbox from './HighlightToolbox';
import FontSizeOptions from './FontSizeOptions';
import { styles, screenWidth } from '../../styles/BookContentPage.styles';
import useBookContent from '../../hooks/useBookContent';

const BookContent = (props) => {
  const api = useBookContent(props);
  const {
    book,
    verses,
    loading,
    currentChapter,
    chapters,
    highlights,
    selectedVerse,
    showToolbox,
    setShowToolbox,
    fontSize,
    showFontSizeOptions,
    setShowFontSizeOptions,
    navigation,
    stripHtml,
    LANGUAGE_OPTIONS,
    goToPrevChapter,
    goToNextChapter,
    handleLanguageChange,
    handleVersePress,
    handleHighlight,
    removeHighlight,
    changeFontSize,
    handleShareVerse,
    setSelectedVerse,
  } = api;

  if (loading && verses.length === 0) return <SplashScreen onFinish={() => {}} duration={2000} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* <Video source={require('../../assets/view.mp4')} style={styles.backgroundVideo} shouldPlay isLooping isMuted resizeMode="cover" /> */}
      <SafeAreaView style={styles.contentOverlay}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#A07553" />
          </TouchableOpacity>
          <Text style={styles.navBarTitle} numberOfLines={1}>{book.name} {currentChapter}</Text>
        </View>
        <View style={styles.chapterNavContainer}>
          <TouchableOpacity style={[styles.chapterNavButton, currentChapter === 1 && styles.disabledButton]} onPress={goToPrevChapter} disabled={currentChapter === 1}>
            <Ionicons name="chevron-back" size={20} color={currentChapter === 1 ? '#CCCCCC' : '#A07553'} />
          </TouchableOpacity>
          <View style={styles.chapterControls}>
            <TouchableOpacity style={styles.controlIconButton} onPress={() => navigation.navigate('SavedVerses')}>
              <Ionicons name="bookmark-outline" size={20} color="#A07553" />
            </TouchableOpacity>
            <CustomPicker options={LANGUAGE_OPTIONS} selectedValue={api.language} onValueChange={handleLanguageChange} containerStyle={styles.compactPickerContainer} compact icon={<Ionicons name="language-outline" size={20} color="#A07553" />} colors={{ primary: '#A07553', background: 'rgba(255, 255, 255, 0.95)', text: { primary: '#333333', secondary: '#666666' }, border: { light: 'rgba(160, 117, 83, 0.2)' } }} />
            <TouchableOpacity style={styles.controlIconButton} onPress={() => { setShowFontSizeOptions(!showFontSizeOptions); setShowToolbox(false); }}>
              <Ionicons name="text-outline" size={20} color="#A07553" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.chapterNavButton, currentChapter === chapters.length && styles.disabledButton]} onPress={goToNextChapter} disabled={currentChapter === chapters.length}>
            <Ionicons name="chevron-forward" size={20} color={currentChapter === chapters.length ? '#CCCCCC' : '#A07553'} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {verses.map((verse) => {
            const isHighlighted = highlights[verse.id] || (verse.number && highlights[`${book.name || book.id}.${currentChapter}.${verse.number}`]);
            return (
              <TouchableOpacity key={verse.id} style={[styles.verse, isHighlighted && { backgroundColor: isHighlighted.color }]} onPress={() => handleVersePress(verse)} onLongPress={() => removeHighlight(verse.id)}>
                <Text style={styles.verseNumber}>{verse.number}</Text>
                <Text style={[styles.verseText, { fontSize, lineHeight: fontSize * 1.6 }]}>{verse.text ? stripHtml(verse.text) : 'Verse text not available'}</Text>
                <TouchableOpacity style={styles.shareButton} onPress={() => { setSelectedVerse(verse); handleShareVerse(); }}>
                  <Ionicons name="share-social-outline" size={22} color="#A07553" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          {verses.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No content available for this chapter</Text>
            </View>
          )}
        </ScrollView>
        <HighlightToolbox visible={showToolbox && selectedVerse} onSelectColor={handleHighlight} onClose={() => setShowToolbox(false)} />
        <FontSizeOptions visible={showFontSizeOptions} onSelectSize={changeFontSize} onClose={() => setShowFontSizeOptions(false)} />
      </SafeAreaView>
      <ViewShot ref={api.shareRef} options={{ format: 'png', quality: 1.0, result: 'tmpfile' }} style={{ position: 'absolute', left: -9999, width: screenWidth * 0.8, padding: 24, backgroundColor: '#111', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8 }}>
        {selectedVerse && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', marginBottom: 12 }}>{book.name} {currentChapter}:{selectedVerse.number}</Text>
            <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center', marginBottom: 8 }}>"{stripHtml(selectedVerse.text)}"</Text>
            <Text style={{ color: '#fff', fontSize: 6, opacity: 0.7 }}>BibleSnap</Text>
          </View>
        )}
      </ViewShot>
      <BottomNavBar />
    </View>
  );
};

export default BookContent;
