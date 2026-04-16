import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import SharedPreferences from 'react-native-shared-preferences';

const defaultJourneyStats = { hasPlan: false, percent: 0, daysRemaining: 0, estimatedDate: null };

export default function useHome() {
  const verseCardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [journeyStats, setJourneyStats] = useState(defaultJourneyStats);

  const calculateOverallProgress = useCallback(async () => {
    try {
      const readingsStr = await AsyncStorage.getItem('bibleReadings');
      const completedData = await AsyncStorage.getItem('completedStudies');
      if (!readingsStr) return 0;
      const allReadings = JSON.parse(readingsStr);
      if (allReadings.length === 0) return 0;
      const completedIds = completedData ? JSON.parse(completedData) : [];
      return Math.min(100, Math.round((completedIds.length / allReadings.length) * 100));
    } catch (e) {
      return 0;
    }
  }, []);

  const loadJourneyStats = useCallback(async () => {
    try {
      const studyPlanStr = await AsyncStorage.getItem('studyPlan');
      if (!studyPlanStr) {
        setJourneyStats(defaultJourneyStats);
        return;
      }
      const studyPlan = JSON.parse(studyPlanStr);
      const readingsStr = await AsyncStorage.getItem('bibleReadings');
      const completedData = await AsyncStorage.getItem('completedStudies');
      
      if (!readingsStr) {
        setJourneyStats(defaultJourneyStats);
        return;
      }
      
      const allReadings = JSON.parse(readingsStr);
      const completedIds = completedData ? JSON.parse(completedData) : [];
      const overallPercent = Math.min(100, Math.round((completedIds.length / allReadings.length) * 100));
      
      let daysRemaining = 0;
      let estimatedDate = null;
      if (studyPlan?.startDate && studyPlan?.days) {
        // Calculate remaining days dynamically based on total lessons and completed lessons
        const totalLessons = allReadings.length;
        daysRemaining = Math.max(0, totalLessons - completedIds.length);
        
        // Calculate estimated completion date based on remaining days
        estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
      }
      setJourneyStats({ hasPlan: true, percent: overallPercent, daysRemaining, estimatedDate });
    } catch (e) {
      setJourneyStats(defaultJourneyStats);
    }
  }, []);

  const checkUserAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      if (isAuth === 'true' && userData) {
        setUser(JSON.parse(userData));
        setIsConnected(true);
      } else {
        setUser(null);
        setIsConnected(false);
      }
    } catch (e) {
      setUser(null);
      setIsConnected(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('https://beta.ourmanna.com/api/v1/get?format=json')
      .then((res) => res.json())
      .then((data) => {
        setVerse(data.verse.details);
        setLoading(false);
        SharedPreferences.setItem('verseOfTheDay', JSON.stringify(data.verse.details));
      })
      .catch(() => setLoading(false));
    loadJourneyStats();
    checkUserAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUserAuth();
      loadJourneyStats();
    }, [checkUserAuth, loadJourneyStats])
  );

  const handleCopyVerse = useCallback(() => {
    if (verse) {
      Clipboard.setStringAsync(`"${verse.text}"\n${verse.reference}`);
      Alert.alert('Copied!', 'Verse copied to clipboard.');
    }
  }, [verse]);

  const handleShareVerse = useCallback(async () => {
    try {
      setIsSharing(true);
      await new Promise((r) => setTimeout(r, 100));
      const uri = await verseCardRef.current?.capture();
      setIsSharing(false);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else Alert.alert('Sharing not available', 'Cannot share image on this device.');
    } catch (e) {
      setIsSharing(false);
      Alert.alert('Error', 'Could not share verse.');
    }
  }, []);

  const handleAuthenticatedAction = useCallback(
    (action) => {
      if (isConnected) action();
      else setShowAuthModal(true);
    },
    [isConnected]
  );

  return {
    verseCardRef,
    verse,
    loading,
    isSharing,
    user,
    isConnected,
    showAuthModal,
    setShowAuthModal,
    authLoading,
    journeyStats,
    handleCopyVerse,
    handleShareVerse,
    checkUserAuth,
    handleAuthenticatedAction,
  };
}
