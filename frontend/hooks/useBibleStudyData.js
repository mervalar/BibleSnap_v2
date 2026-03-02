import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBibleReadings } from '../api/bibleReadingService';
import { fetchBooks } from '../api/bookService';

export default function useBibleStudyData(isAuthenticated) {
  const [loading, setLoading] = useState(true);
  const [bibleReadings, setBibleReadings] = useState([]);
  const [books, setBooks] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());
  const [studyPlan, setStudyPlan] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [planDays, setPlanDays] = useState(365);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const readings = await fetchBibleReadings();
        if (!cancelled) setBibleReadings(readings || []);
        try {
          const b = await fetchBooks();
          if (!cancelled) setBooks(b || []);
        } catch (e) {
          console.error('Error fetching books (non-critical):', e);
          if (!cancelled) setBooks([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    AsyncStorage.getItem('bibleProgress').then((data) => {
      if (data) setProgressMap(JSON.parse(data));
    });
    AsyncStorage.getItem('completedStudies').then((data) => {
      if (data) setCompletedStudies(new Set(JSON.parse(data)));
    });
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const r = await AsyncStorage.getItem('studyPlan');
        if (r) {
          const plan = JSON.parse(r);
          setStudyPlan(plan);
          setPlanDays(plan.days);
          if (plan.startDate) setStartDate(new Date(plan.startDate));
        }
      } catch (e) {
        console.error('Error loading study plan', e);
      }
    };
    loadPlan();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
  }, [progressMap]);

  const refreshCompleted = useCallback(() => {
    AsyncStorage.getItem('completedStudies').then((data) => {
      if (data) setCompletedStudies(new Set(JSON.parse(data)));
    });
  }, []);

  return {
    loading,
    bibleReadings,
    books,
    progressMap,
    setProgressMap,
    completedStudies,
    setCompletedStudies,
    studyPlan,
    setStudyPlan,
    startDate,
    setStartDate,
    planDays,
    setPlanDays,
    refreshCompleted,
  };
}
