import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBibleReadings } from '../api/bibleReadingService';
import { fetchBooks } from '../api/bookService';

export default function useBibleStudyData(isAuthenticated) {
  const [loading, setLoading] = useState(true);
  const [bibleReadings, setBibleReadings] = useState([]);
  const [books, setBooks] = useState([]);
  const [booksError, setBooksError] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [completedStudies, setCompletedStudies] = useState(new Set());
  const [studyPlan, setStudyPlan] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [planDays, setPlanDays] = useState(365);
  const [bookPlans, setBookPlans] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('bookPlans').then((data) => {
      if (data) setBookPlans(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('bookPlans', JSON.stringify(bookPlans));
  }, [bookPlans]);

  const loadBooks = useCallback(() => {
    setBooksError(false);
    return fetchBooks()
      .then((b) => { setBooks(b || []); return b; })
      .catch(() => { setBooks([]); setBooksError(true); });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const CACHE_KEY = 'cache_bibleReadings';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    // Books are always fetched independently — they are not cached so they
    // would silently stay empty whenever the readings cache short-circuits.
    loadBooks();

    const load = async () => {
      // Show cached data immediately if available
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (!cancelled && data?.length) {
            setBibleReadings(data);
            setLoading(false);
            // If cache is fresh enough, skip the network fetch
            if (Date.now() - ts < CACHE_TTL) return;
          }
        }
      } catch (_) {}

      // Fetch from network (first load or cache expired)
      try {
        const readings = await fetchBibleReadings().catch(() => null);
        if (!cancelled) {
          if (readings?.length) {
            setBibleReadings(readings);
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: readings, ts: Date.now() }));
          }
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

  const toggleBookChapter = useCallback((bookName, chapter) => {
    setBookPlans((prev) => {
      const current = prev[bookName] || { chaptersRead: [], plan: null };
      const read = new Set(current.chaptersRead);
      const dateKey = `bookChapter_${bookName}_${chapter}_date`;
      if (read.has(chapter)) {
        read.delete(chapter);
        AsyncStorage.removeItem(dateKey);
      } else {
        read.add(chapter);
        AsyncStorage.setItem(dateKey, String(Date.now()));
      }
      const next = { ...prev, [bookName]: { ...current, chaptersRead: Array.from(read).sort((a, b) => a - b) } };
      AsyncStorage.setItem('bookPlans', JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshCompleted = useCallback(() => {
    AsyncStorage.getItem('completedStudies').then((data) => {
      if (data) setCompletedStudies(new Set(JSON.parse(data)));
    });
  }, []);

  return {
    loading,
    bibleReadings,
    books,
    booksError,
    retryBooks: loadBooks,
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
    bookPlans,
    toggleBookChapter,
  };
}
