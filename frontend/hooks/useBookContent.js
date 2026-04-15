import { useState, useEffect, useRef } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import biblePreferences from '../api/biblePreferences';
import { API_KEY, LANGUAGE_OPTIONS, stripHtml } from '../constants/bibleApi';

export default function useBookContent(props = {}) {
  const route = useRoute();
  const nav = useNavigation();
  const navigation = props.navigation || nav;
  const routeParams = props.route?.params || route?.params || {};
  const book = routeParams.book || { id: '', name: '' };
  const initialChapter = routeParams.chapter || { number: '1' };
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(parseInt(initialChapter?.number, 10) || 1);
  const [chapters, setChapters] = useState([]);
  const [highlights, setHighlights] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showToolbox, setShowToolbox] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
  const [language, setLanguage] = useState(routeParams.language || 'english');
  const [bibleId, setBibleId] = useState(routeParams.bibleId || '65eec8e0b60e656b-01');
  const shareRef = useRef();
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;

  const saveHighlights = async () => {
    try {
      if (book?.id) await AsyncStorage.setItem(`highlights_${book.id}`, JSON.stringify(highlightsRef.current));
    } catch (e) {}
  };

  const loadHighlights = async () => {
    if (!book?.id) return;
    try {
      const data = await AsyncStorage.getItem(`highlights_${book.id}`);
      setHighlights(data ? JSON.parse(data) : {});
    } catch (e) {
      setHighlights({});
    }
  };

  const fetchChapters = async () => {
    if (!book?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${book.id}/chapters`, { headers: { 'api-key': API_KEY } });
      const data = await res.json();
      setChapters(data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load chapters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterContent = async (chapterNum) => {
    const chapter = chapters.find((c) => c.number === String(chapterNum));
    if (!chapter) return;
    try {
      setLoading(true);
      const versesRes = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapter.id}/verses`, { headers: { 'api-key': API_KEY } });
      const versesData = await versesRes.json();
      const chapterVerses = versesData.data || [];
      const withText = await Promise.all(
        chapterVerses.map(async (v) => {
          try {
            const r = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${v.id}`, { headers: { 'api-key': API_KEY } });
            const d = await r.json();
            return { ...v, text: d.data?.content || '' };
          } catch (err) {
            return { ...v, text: '' };
          }
        })
      );
      setVerses(withText);
      if (book?.id) loadHighlights();
    } catch (e) {
      Alert.alert('Error', `Failed to load chapter ${chapterNum}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (book?.id) {
      fetchChapters();
      loadHighlights();
    }
    return () => { saveHighlights(); };
  }, [book?.id, bibleId]);

  useEffect(() => {
    if (chapters.length > 0) fetchChapterContent(currentChapter);
  }, [currentChapter, chapters]);

  useEffect(() => {
    const num = parseInt(initialChapter?.number, 10);
    if (chapters.length > 0 && !isNaN(num)) setCurrentChapter(num);
  }, [initialChapter, chapters]);

  useEffect(() => {
    if (book?.id) AsyncStorage.setItem(`book_info_${book.id}`, JSON.stringify({ id: book.id, name: book.name })).catch(() => {});
  }, [book]);

  useEffect(() => {
    AsyncStorage.getItem('bible_font_size').then((v) => { if (v) setFontSize(parseInt(v, 10)); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (routeParams.language) setLanguage(routeParams.language);
    if (routeParams.bibleId) setBibleId(routeParams.bibleId);
  }, [routeParams.bibleId, routeParams.language]);

  const handleLanguageChange = (langValue) => {
    setLanguage(langValue);
    const selected = LANGUAGE_OPTIONS.find((o) => o.value === langValue);
    if (selected) {
      setBibleId(selected.bibleId);
      biblePreferences.storeLanguagePreference(langValue, selected.bibleId);
    }
  };

  const handleVersePress = (verse) => { setSelectedVerse(verse); setShowToolbox(true); };

  const handleHighlight = async (color) => {
    if (!selectedVerse) return;
    
    // If color is null, remove the highlight
    if (color === null) {
      await removeHighlight(selectedVerse.id);
      setShowToolbox(false);
      return;
    }
    
    const verseNumber = selectedVerse.number || parseInt(selectedVerse.id.split('.').pop(), 10) || 1;
    const highlightData = { color, text: stripHtml(selectedVerse.text), reference: `${currentChapter}:${verseNumber}` };
    setHighlights((prev) => ({ ...prev, [selectedVerse.id]: highlightData }));
    try {
      const key = `highlights_${book.id}`;
      const existing = await AsyncStorage.getItem(key);
      const merged = { ...(existing ? JSON.parse(existing) : {}), [selectedVerse.id]: highlightData };
      await AsyncStorage.setItem(key, JSON.stringify(merged));
      await AsyncStorage.setItem(`book_info_${book.id}`, JSON.stringify({ id: book.id, name: book.name }));
      setShowToolbox(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save the highlighted verse');
    }
  };

  const removeHighlight = async (verseId) => {
    setHighlights((prev) => { const next = { ...prev }; delete next[verseId]; return next; });
    try {
      const key = `highlights_${book.id}`;
      const data = await AsyncStorage.getItem(key);
      if (data) { const o = JSON.parse(data); delete o[verseId]; await AsyncStorage.setItem(key, JSON.stringify(o)); }
    } catch (e) {}
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    setShowFontSizeOptions(false);
    AsyncStorage.setItem('bible_font_size', String(size)).catch(() => {});
  };

  const handleShareVerse = async () => {
    if (!selectedVerse) { Alert.alert('No verse selected', 'Please select a verse to share.'); return; }
    try {
      setTimeout(async () => {
        try {
          const uri = await shareRef.current?.capture();
          if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
          else Alert.alert('Sharing not available');
        } catch (e) {
          Alert.alert('Error', 'Could not share the verse.');
        }
      }, 500);
    } catch (e) {}
  };

  return {
    book, verses, loading, currentChapter, chapters, highlights, selectedVerse, showToolbox, setShowToolbox,
    fontSize, showFontSizeOptions, setShowFontSizeOptions, language, bibleId, shareRef, navigation,
    stripHtml, LANGUAGE_OPTIONS,
    goToPrevChapter: () => currentChapter > 1 && setCurrentChapter(currentChapter - 1),
    goToNextChapter: () => currentChapter < chapters.length && setCurrentChapter(currentChapter + 1),
    handleLanguageChange, handleVersePress, handleHighlight, removeHighlight, changeFontSize, handleShareVerse, setSelectedVerse,
  };
}

export { stripHtml, LANGUAGE_OPTIONS };
