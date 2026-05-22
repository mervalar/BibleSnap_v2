import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchJournals } from '../api/journalApi';
import {
  loadWeeklyProgressFromStorage,
  getChartInsight,
  loadStudyPlanSummaryFromStorage,
  loadSavedVersesCountFromStorage,
} from '../utils/profileStats';

export default function useProfile(navigation) {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const [savedVersesCount, setSavedVersesCount] = useState(0);
  const [studyPlanSummary, setStudyPlanSummary] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [weekAverage, setWeekAverage] = useState(0);
  const [chartInsight, setChartInsight] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (isAuth === 'true' && userData) {
        setUser(JSON.parse(userData));
        setUserToken(token);
      } else {
        navigation.goBack();
      }
    } catch (e) {
      console.error('Error fetching user data', e);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  const loadWeeklyProgress = useCallback(async () => {
    try {
      const { weekData, streak, total, average } = await loadWeeklyProgressFromStorage();
      setWeeklyProgress(weekData);
      setCurrentStreak(streak);
      setWeekTotal(total);
      setWeekAverage(average);
      setChartInsight(getChartInsight(weekData, total));
    } catch (e) {
      console.error('Error loading weekly progress', e);
    }
  }, []);

  const loadSavedVersesCount = useCallback(async () => {
    try {
      setSavedVersesCount(await loadSavedVersesCountFromStorage());
    } catch (e) {
      console.error('Error loading saved verses count', e);
    }
  }, []);

  const loadJournalCount = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        const journals = await fetchJournals(parsed?.id);
        setJournalCount(journals.length);
      }
    } catch (e) {
      console.error('Failed to load journal count', e);
    }
  }, []);

  const loadPlanSummary = useCallback(async () => {
    try {
      setStudyPlanSummary(await loadStudyPlanSummaryFromStorage());
    } catch (e) {
      console.error('Error loading study plan', e);
      setStudyPlanSummary(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      loadWeeklyProgress();
      loadSavedVersesCount();
      loadJournalCount();
      loadPlanSummary();
    }, [fetchUserData, loadWeeklyProgress, loadSavedVersesCount, loadJournalCount, loadPlanSummary])
  );

  const openEditModal = useCallback(() => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setModalVisible(true);
  }, [user]);

  const handleSaveEdit = useCallback(async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setUpdateLoading(true);
      const res = await fetch('https://biblesnap.bellatis.com/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (e) {
      console.error('Update error', e);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setUpdateLoading(false);
    }
  }, [editName, editEmail, userToken]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch('https://biblesnap.bellatis.com/api/user', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
              });
              const data = await res.json();
              if (data.success) {
                await AsyncStorage.multiRemove(['user', 'isAuthenticated', 'token']);
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              } else {
                Alert.alert('Error', data.message || 'Failed to delete account');
              }
            } catch (e) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  }, [userToken, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['user', 'isAuthenticated', 'token']);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          } catch (e) {
            console.error('Error logging out', e);
          }
        },
      },
    ]);
  }, [navigation]);

  const openDayDetail = useCallback((index, value) => {
    if (value <= 0) return;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    setSelectedDayData({
      day: dayNames[index],
      dayShort: dayNames[index].substring(0, 3),
      value,
      index,
    });
    setShowProgressModal(true);
  }, []);

  return {
    user,
    loading,
    modalVisible,
    setModalVisible,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    updateLoading,
    journalCount,
    savedVersesCount,
    studyPlanSummary,
    weeklyProgress,
    currentStreak,
    weekTotal,
    weekAverage,
    chartInsight,
    showProgressModal,
    setShowProgressModal,
    selectedDayData,
    fetchUserData,
    openEditModal,
    handleSaveEdit,
    handleLogout,
    handleDeleteAccount,
    openDayDetail,
  };
}
