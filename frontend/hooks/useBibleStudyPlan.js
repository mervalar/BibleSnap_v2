import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { buildSchedule } from '../utils/bibleStudyUtils';
import { computePlanStats, getTodaysReadingIds, computeEncouragementMessage } from '../utils/bibleStudyPlanStats';

const CONSISTENCY_KEY_PREFIX = 'consistencyNotificationShown_';

export default function useBibleStudyPlan(data) {
  const {
    bibleReadings,
    studyPlan,
    setStudyPlan,
    progressMap,
    setProgressMap,
    completedStudies,
    setCompletedStudies,
    startDate,
    setStartDate,
    planDays,
    setPlanDays,
    refreshCompleted,
  } = data || {};

  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [planStats, setPlanStats] = useState({ percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null });
  const [todaysReadingIds, setTodaysReadingIds] = useState(new Set());
  const [encouragementMessage, setEncouragementMessage] = useState(null);
  const [planJustChanged, setPlanJustChanged] = useState(false);
  const [readingStats, setReadingStats] = useState({ lessonsAhead: 0, consistency: 0, streak: 0 });

  const updatePlanStats = useCallback(async () => {
    if (!studyPlan || !bibleReadings?.length) {
      setPlanStats((p) => ({ ...p, percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null }));
      setTodaysReadingIds(new Set());
      return;
    }
    const completedData = await AsyncStorage.getItem('completedStudies');
    const completedIds = completedData ? JSON.parse(completedData) : [];
    setPlanStats(computePlanStats(studyPlan, bibleReadings, completedIds));
    setTodaysReadingIds(getTodaysReadingIds(studyPlan, bibleReadings));
  }, [studyPlan, bibleReadings]);

  useEffect(() => {
    updatePlanStats();
  }, [updatePlanStats, progressMap, completedStudies, planJustChanged]);

  useEffect(() => {
    if (planModalVisible && studyPlan) setPlanDays(studyPlan.days);
  }, [planModalVisible, studyPlan]);

  const savePlan = useCallback(
    async (days, chosenStartDate) => {
      if (!bibleReadings?.length) return;
      const existingPlan = await AsyncStorage.getItem('studyPlan');
      const previousPlan = existingPlan ? JSON.parse(existingPlan) : null;
      const planChanged = previousPlan && previousPlan.days !== days;
      if (planChanged) {
        await AsyncStorage.removeItem('bibleProgress');
        await AsyncStorage.removeItem('completedStudies');
        const allKeys = await AsyncStorage.getAllKeys();
        const lessonKeys = allKeys.filter((k) => k.startsWith('lesson_') && k.includes('_completed'));
        await AsyncStorage.multiRemove(lessonKeys);
        setProgressMap({});
        setCompletedStudies(new Set());
        await AsyncStorage.removeItem('dailyReadingHistory');
        await AsyncStorage.removeItem('readingStreak');
        await AsyncStorage.removeItem('lastReadingDate');
        setPlanJustChanged(true);
      }
      const schedule = buildSchedule(bibleReadings, days);
      const chosenStart = chosenStartDate || startDate || new Date();
      setStartDate(chosenStart);
      const plan = { days, startDate: chosenStart.toISOString(), schedule, planChangedAt: new Date().toISOString() };
      await AsyncStorage.setItem('studyPlan', JSON.stringify(plan));
      setStudyPlan(plan);
      setPlanModalVisible(false);
      if (planChanged || !previousPlan) {
        setEncouragementMessage({ type: 'happy', emoji: '🎯', text: `You've started a ${days}-day Bible reading challenge! Let's do this!` });
        setTimeout(() => {
          setEncouragementMessage(null);
          setTimeout(() => setPlanJustChanged(false), 1000);
        }, 5000);
      }
    },
    [bibleReadings, startDate, setStudyPlan, setProgressMap, setCompletedStudies, setStartDate]
  );

  const runEncouragement = useCallback(async () => {
    if (!studyPlan || !bibleReadings?.length || planJustChanged) return;
    const start = new Date(studyPlan.startDate);
    const now = new Date();
    const diff = Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.max(0, Math.min(studyPlan.days, diff + 1));
    const completedData = await AsyncStorage.getItem('completedStudies');
    const completedIds = completedData ? JSON.parse(completedData) : [];
    let expectedCompleted = studyPlan.days === 365 ? elapsedDays : 0;
    if (studyPlan.days !== 365 && studyPlan.schedule) {
      for (let i = 0; i <= Math.min(elapsedDays - 1, studyPlan.schedule.length - 1); i++) {
        expectedCompleted += (studyPlan.schedule[i] || []).length;
      }
    }
    const lessonsAhead = completedIds.length - expectedCompleted;
    const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
    const history = dailyHistory ? JSON.parse(dailyHistory) : {};
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last7.push(history[d.toISOString().split('T')[0]] || 0);
    }
    const consistency = Math.round((last7.filter((c) => c > 0).length / 7) * 100);
    let streak = 0;
    const lastReading = await AsyncStorage.getItem('lastReadingDate');
    if (lastReading) {
      const last = new Date(lastReading);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      last.setHours(0, 0, 0, 0);
      if (Math.floor((today - last) / (1000 * 60 * 60 * 24)) === 0) {
        let cur = new Date(today);
        while (history[cur.toISOString().split('T')[0]] > 0) {
          streak++;
          cur.setDate(cur.getDate() - 1);
        }
      }
    }
    setReadingStats({ lessonsAhead, consistency, streak });
    const todayKey = now.toISOString().split('T')[0];
    const shown = (await AsyncStorage.getItem(CONSISTENCY_KEY_PREFIX + todayKey)) === 'true';
    const message = computeEncouragementMessage(lessonsAhead, consistency, streak, planJustChanged, shown);
    if (message) {
      await AsyncStorage.setItem(CONSISTENCY_KEY_PREFIX + todayKey, 'true');
      setEncouragementMessage(message);
      setTimeout(() => setEncouragementMessage(null), 5000);
    }
  }, [studyPlan, bibleReadings, planJustChanged]);

  useFocusEffect(
    useCallback(() => {
      refreshCompleted?.();
    }, [refreshCompleted])
  );

  useFocusEffect(
    useCallback(() => {
      if (!studyPlan || !bibleReadings?.length) return;
      const t = setTimeout(() => runEncouragement(), 300);
      return () => clearTimeout(t);
    }, [studyPlan, bibleReadings, planJustChanged, runEncouragement])
  );

  return {
    planModalVisible,
    setPlanModalVisible,
    planStats,
    todaysReadingIds,
    encouragementMessage,
    setEncouragementMessage,
    planDays,
    startDate,
    savePlan,
    planJustChanged,
    readingStats,
    updatePlanStats,
  };
}
