import AsyncStorage from '@react-native-async-storage/async-storage';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Load weekly progress (count per weekday) and streak from completed studies. */
export async function loadWeeklyProgressFromStorage() {
  const completedData = await AsyncStorage.getItem('completedStudies');
  const completedIds = completedData ? JSON.parse(completedData) : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekData = [0, 0, 0, 0, 0, 0, 0];

  for (const id of completedIds) {
    const timestamp = await AsyncStorage.getItem(`lesson_${id}_completed_date`);
    if (timestamp) {
      const completedDate = new Date(parseInt(timestamp));
      completedDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - daysDiff);
        const targetDayOfWeek = targetDate.getDay();
        const arrayIndex = targetDayOfWeek === 0 ? 6 : targetDayOfWeek - 1;
        weekData[arrayIndex]++;
      }
    }
  }

  const allKeys = await AsyncStorage.getAllKeys();
  const chapterDateKeys = allKeys.filter((k) => k.startsWith('bookChapter_') && k.endsWith('_date'));
  for (const key of chapterDateKeys) {
    const timestamp = await AsyncStorage.getItem(key);
    if (timestamp) {
      const completedDate = new Date(parseInt(timestamp));
      completedDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - daysDiff);
        const targetDayOfWeek = targetDate.getDay();
        const arrayIndex = targetDayOfWeek === 0 ? 6 : targetDayOfWeek - 1;
        weekData[arrayIndex]++;
      }
    }
  }

  let streak = 0;
  for (let i = 6; i >= 0; i--) {
    if (weekData[i] > 0) streak++;
    else if (i < 6) break;
  }
  const total = weekData.reduce((sum, val) => sum + val, 0);
  const average = Math.round((total / 7) * 10) / 10;
  return { weekData, streak, total, average };
}

/** Generate insight message from weekly stats. */
export function getChartInsight(weekData, total) {
  const activeDays = weekData.filter((val) => val > 0).length;
  const maxDay = Math.max(...weekData);
  const maxDayIndex = weekData.indexOf(maxDay);
  if (total === 0) {
    return { type: 'motivation', emoji: '🌟', text: "Start your journey today! Even one lesson makes a difference." };
  }
  if (activeDays >= 5) {
    return { type: 'excellent', emoji: '🔥', text: `Amazing! You're reading ${activeDays} days this week! Keep the momentum!` };
  }
  if (maxDay >= 3) {
    return { type: 'great', emoji: '💪', text: `Wow! ${maxDay} lessons on ${DAY_NAMES[maxDayIndex]}! You're on fire!` };
  }
  if (activeDays >= 3) {
    return { type: 'good', emoji: '✨', text: `Good progress! ${activeDays} active days. Try to read every day for best results!` };
  }
  return { type: 'encourage', emoji: '📖', text: `You've completed ${total} lessons this week. Try to read a bit more each day!` };
}

/** Load study plan summary from AsyncStorage. */
export async function loadStudyPlanSummaryFromStorage() {
  const raw = await AsyncStorage.getItem('studyPlan');
  if (!raw) return null;
  const plan = JSON.parse(raw);
  if (!plan.days || plan.days <= 0) return null;

  const progressData = await AsyncStorage.getItem('bibleProgress');
  const progressMap = progressData ? JSON.parse(progressData) : {};
  const completedData = await AsyncStorage.getItem('completedStudies');
  const completedIds = completedData ? JSON.parse(completedData) : [];
  const completedSet = new Set(completedIds);
  const bibleReadingsData = await AsyncStorage.getItem('bibleReadings');
  let totalLessons = 0;
  let completedLessons = 0;
  if (bibleReadingsData) {
    const readings = JSON.parse(bibleReadingsData);
    totalLessons = readings.length;
    completedLessons = readings.filter((r) => (progressMap[r.id] || 0) === 100 || completedSet.has(r.id)).length;
  }
  if (totalLessons === 0) return null;

  const percent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
  const remainingLessons = Math.max(0, totalLessons - completedLessons);
  const lessonsPerDay = totalLessons / plan.days;
  const daysRemaining = lessonsPerDay > 0 ? Math.max(0, Math.ceil(remainingLessons / lessonsPerDay)) : plan.days;
  const finishDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

  const start = new Date(plan.startDate);
  const today = new Date();
  const diff = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.max(0, Math.min(plan.days, diff + 1));
  let expectedCompleted = plan.days === 365 ? elapsedDays : 0;
  if (plan.days !== 365 && plan.schedule) {
    for (let i = 0; i <= Math.min(elapsedDays - 1, plan.schedule.length - 1); i++) {
      expectedCompleted += (plan.schedule[i] || []).length;
    }
  }
  const lessonsAhead = completedLessons - expectedCompleted;

  const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
  const history = dailyHistory ? JSON.parse(dailyHistory) : {};
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(history[date.toISOString().split('T')[0]] || 0);
  }
  const consistency = Math.round((last7Days.filter((c) => c > 0).length / 7) * 100);
  const streakData = await AsyncStorage.getItem('readingStreak');
  const streak = streakData ? parseInt(streakData, 10) : 0;

  return {
    days: plan.days,
    percent,
    daysRemaining,
    finishDate: finishDate.toISOString(),
    startDate: plan.startDate,
    totalLessons,
    completedLessons,
    lessonsAhead,
    consistency,
    streak,
  };
}

/** Count saved verses (highlights) from AsyncStorage. */
export async function loadSavedVersesCountFromStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const highlightKeys = keys.filter((k) => k.startsWith('highlights_'));
  let total = 0;
  for (const key of highlightKeys) {
    const data = await AsyncStorage.getItem(key);
    if (data) total += Object.keys(JSON.parse(data)).length;
  }
  return total;
}
