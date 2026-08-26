import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import SharedPreferences from 'react-native-shared-preferences';
import { getTodaysStudyReadings } from '../utils/bibleStudyPlanStats';

export default function useHome() {
  const verseCardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [todaysStudy, setTodaysStudy] = useState(null);

  const loadTodaysStudy = useCallback(async () => {
    try {
      const studyPlanStr = await AsyncStorage.getItem('studyPlan');
      const cacheStr = await AsyncStorage.getItem('cache_bibleReadings');
      if (!studyPlanStr || !cacheStr) {
        setTodaysStudy(null);
        return;
      }
      const studyPlan = JSON.parse(studyPlanStr);
      const { data: allReadings } = JSON.parse(cacheStr);
      const completedData = await AsyncStorage.getItem('completedStudies');
      const completedIds = completedData ? JSON.parse(completedData) : [];

      const dueToday = getTodaysStudyReadings(studyPlan, allReadings);
      const nextReading = dueToday.find((r) => !completedIds.includes(r.id)) || null;
      setTodaysStudy(nextReading ? { reading: nextReading, allReadings } : null);
    } catch (e) {
      setTodaysStudy(null);
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
    checkUserAuth();
    loadTodaysStudy();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUserAuth();
      loadTodaysStudy();
    }, [checkUserAuth, loadTodaysStudy])
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
    todaysStudy,
    handleCopyVerse,
    handleShareVerse,
    checkUserAuth,
    handleAuthenticatedAction,
  };
}
