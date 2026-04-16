import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';
import * as Sharing from 'expo-sharing';
import { API_KEY } from '../constants/bibleApi';
import { getBookInfoFromReading, formatBooks, toggleLessonCompletion, formatDate as fmtDate, getVerseReference as getRef, getVerseText as getText } from '../utils/bibleStudyContentUtils';

export default function useBibleStudyContent() {
  const route = useRoute();
  const reading = route?.params?.bibleReading || {};
  const allReadings = route?.params?.allReadings || [];
  const [isChecked, setIsChecked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bibleId, setBibleId] = useState('65eec8e0b60e656b-01');
  const [language, setLanguage] = useState('english');
  const [isSharing, setIsSharing] = useState(false);
  const [totalDays, setTotalDays] = useState(365);
  const [planStats, setPlanStats] = useState({ percent: 0, daysRemaining: 0, estimatedDate: null });
  const [apiBooks, setApiBooks] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(1);
  const shareCardRef = useRef(null);
  const scrollViewRef = useRef(null);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const currentProgressRef = useRef(1);

  const updatePlanStats = useCallback(async () => {
    const totalLessons = allReadings?.length || 0;
    if (totalLessons === 0) return;
    try {
      const completedData = await AsyncStorage.getItem('completedStudies');
      const completedIds = completedData ? JSON.parse(completedData) : [];
      const daysRemaining = Math.max(0, totalLessons - completedIds.length);
      const percent = totalLessons > 0 ? Math.min(100, Math.round((completedIds.length / totalLessons) * 100)) : 0;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
      setPlanStats({ percent, daysRemaining, estimatedDate });
    } catch (e) {
      console.error('Error updating plan stats', e);
    }
  }, [allReadings?.length]);

  useEffect(() => {
    (async () => {
      try {
        const [savedLang, savedBible, planData] = await Promise.all([AsyncStorage.getItem('selectedLanguage'), AsyncStorage.getItem('selectedBibleId'), AsyncStorage.getItem('studyPlan')]);
        if (savedLang) setLanguage(savedLang);
        if (savedBible) setBibleId(savedBible);
        if (planData) setTotalDays(JSON.parse(planData).days || 365);
      } catch (e) { console.error('Error loading Bible preferences', e); }
    })();
  }, []);

  useEffect(() => {
    const t = InteractionManager.runAfterInteractions(() => {
      if (!bibleId) return;
      (async () => {
        try {
          const cacheKey = `api_books_${bibleId}`;
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) { setApiBooks(JSON.parse(cached)); return; }
          const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books`, { headers: { 'api-key': API_KEY } });
          if (res.ok) { const d = await res.json(); setApiBooks(d.data || []); await AsyncStorage.setItem(cacheKey, JSON.stringify(d.data || [])); }
        } catch (e) { console.error('Error fetching books', e); }
      })();
    });
    return () => t.cancel();
  }, [bibleId]);

  useEffect(() => {
    if (!reading.id) return;
    (async () => {
      try {
        const progressMap = JSON.parse(await AsyncStorage.getItem('bibleProgress') || '{}');
        const value = progressMap[reading.id] !== undefined && progressMap[reading.id] >= 1 ? Math.min(100, progressMap[reading.id]) : 1;
        currentProgressRef.current = value;
        setCurrentProgress(value);
        route?.params?.onProgressUpdate?.(value);
      } catch (e) { currentProgressRef.current = 1; setCurrentProgress(1); }
    })();
  }, [reading.id]);

  useEffect(() => { updatePlanStats(); }, [updatePlanStats]);

  useFocusEffect(useCallback(() => {
    updatePlanStats();
    (async () => {
      try {
        const completed = await AsyncStorage.getItem(`lesson_${reading.id}_completed`);
        setIsChecked(completed === 'true');
        const progressMap = JSON.parse(await AsyncStorage.getItem('bibleProgress') || '{}');
        const value = progressMap[reading.id] !== undefined && progressMap[reading.id] >= 1 ? Math.max(1, Math.min(100, progressMap[reading.id])) : 1;
        currentProgressRef.current = value;
        setCurrentProgress(value);
      } catch (e) { setIsChecked(false); currentProgressRef.current = 1; setCurrentProgress(1); }
    })();
  }, [reading.id, updatePlanStats]));

  const updateProgressFromScroll = useCallback(
    async (contentHeight, scrollY, layoutHeight) => {
      if (contentHeight <= 0) return;
      const ratio = Math.min(1, Math.max(0, (scrollY + layoutHeight) / contentHeight));
      const newProgress = Math.max(1, Math.min(100, Math.round(ratio * 99) + 1));
      if (newProgress <= currentProgressRef.current) return;
      currentProgressRef.current = newProgress;
      setCurrentProgress(newProgress);
      try {
        const progressData = await AsyncStorage.getItem('bibleProgress');
        const progressMap = progressData ? JSON.parse(progressData) : {};
        progressMap[reading.id] = newProgress;
        await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
        if (route?.params?.onProgressUpdate) route.params.onProgressUpdate(newProgress);
      } catch (e) {}
    },
    [reading.id, route?.params?.onProgressUpdate]
  );

  const handleCheckToggle = useCallback(async () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    try {
      await toggleLessonCompletion(reading.id, newChecked, currentProgressRef, route?.params?.onProgressUpdate);
      if (newChecked) {
        currentProgressRef.current = 100;
        setCurrentProgress(100);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      } else {
        currentProgressRef.current = 1;
        setCurrentProgress(1);
      }
      updatePlanStats();
    } catch (error) {
      console.error('Error saving completion status', error);
    }
  }, [reading.id, isChecked, route?.params?.onProgressUpdate, updatePlanStats]);

  const bookInfo = useMemo(() => getBookInfoFromReading(reading, apiBooks), [reading?.books, apiBooks, reading?.id]);

  const nextReading = useMemo(() => {
    if (!allReadings?.length) return null;
    const idx = allReadings.findIndex((r) => r.id === reading.id);
    if (idx === -1 || idx >= allReadings.length - 1) return null;
    return allReadings[idx + 1];
  }, [allReadings, reading.id]);

  const handleShare = useCallback(async () => {
    try {
      setIsSharing(true);
      await new Promise((r) => setTimeout(r, 100));
      const uri = await shareCardRef.current?.capture();
      setIsSharing(false);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else Alert.alert('Sharing not available', 'Cannot share image on this device.');
    } catch (e) {
      setIsSharing(false);
      Alert.alert('Error', 'Could not share image.');
    }
  }, []);

  const formatDate = useCallback(() => fmtDate(), []);
  const getVerseReference = useCallback(() => getRef(reading, language), [reading?.main_verse, language]);
  const getVerseText = useCallback(() => getText(reading), [reading?.verse_text, reading?.explanation, reading?.main_verse]);

  return {
    reading,
    allReadings,
    isChecked,
    showCelebration,
    showBookModal,
    setShowBookModal,
    bibleId,
    language,
    isSharing,
    totalDays,
    planStats,
    apiBooks,
    bookInfo,
    currentProgress,
    shareCardRef,
    scrollViewRef,
    contentHeightRef,
    scrollYRef,
    updateProgressFromScroll,
    handleCheckToggle,
    nextReading,
    handleShare,
    formatDate,
    getVerseReference,
    getVerseText,
    formatBooks,
    updatePlanStats,
    route,
  };
}
