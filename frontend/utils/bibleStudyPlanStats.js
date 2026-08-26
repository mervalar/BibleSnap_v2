/** Compute plan stats from study plan, readings, and completed IDs. */
export function computePlanStats(studyPlan, bibleReadings, completedIds) {
  if (!studyPlan || !bibleReadings?.length) {
    return { percent: 0, elapsedDays: 0, daysRemaining: 0, finishDate: null, startDate: null, estimatedDate: null };
  }
  const start = new Date(studyPlan.startDate);
  const now = new Date();
  const diff = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.max(1, Math.min(studyPlan.days, diff + 1));
  const totalLessons = bibleReadings.length;
  const completedLessons = completedIds.length;
  let percent = 0;
  if (studyPlan.days === 365) {
    percent = elapsedDays <= 100 ? Math.max(1, elapsedDays) : 100;
    const lessonsBased = Math.min(100, Math.round((completedLessons / 365) * 100));
    if (completedLessons > elapsedDays && lessonsBased > percent) percent = lessonsBased;
    if (elapsedDays > 0 || completedLessons > 0) percent = Math.max(1, percent);
  } else {
    percent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;
  }
  const daysRemaining = Math.max(0, studyPlan.days - elapsedDays);
  const finishDate = new Date(start.getTime() + (studyPlan.days - 1) * 24 * 60 * 60 * 1000);
  
  // Calculate estimated date based on remaining lessons (dynamic)
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
  
  return {
    percent,
    elapsedDays,
    daysRemaining,
    finishDate: finishDate.toISOString(),
    startDate: studyPlan.startDate,
    estimatedDate: estimatedDate.toISOString(),
  };
}

/** Get set of reading IDs for today based on plan schedule. */
export function getTodaysReadingIds(studyPlan, bibleReadings) {
  if (!studyPlan?.schedule?.length || studyPlan.days === 365) return new Set();
  const start = new Date(studyPlan.startDate);
  const now = new Date();
  const diff = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  const dayIndex = Math.max(0, Math.min(studyPlan.days - 1, diff));
  const todayDayIds = studyPlan.schedule[dayIndex] || [];
  const todayIds = new Set();
  bibleReadings.forEach((reading) => {
    if (todayDayIds.includes(reading.day)) todayIds.add(reading.id);
  });
  return todayIds;
}

/** Get the actual reading(s) scheduled for today, for both 365-day (one lesson
 * per calendar day) and shorter plans (batched via studyPlan.schedule). */
export function getTodaysStudyReadings(studyPlan, bibleReadings) {
  if (!studyPlan?.startDate || !bibleReadings?.length) return [];
  const start = new Date(studyPlan.startDate);
  const now = new Date();
  const diff = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  if (studyPlan.days === 365) {
    const dayNumber = Math.max(1, Math.min(365, diff + 1));
    return bibleReadings.filter((r) => r.day === dayNumber);
  }
  if (!studyPlan.schedule?.length) return [];
  const dayIndex = Math.max(0, Math.min(studyPlan.days - 1, diff));
  const todayDayIds = studyPlan.schedule[dayIndex] || [];
  return bibleReadings.filter((r) => todayDayIds.includes(r.day));
}

/** Compute encouragement message from stats. Returns { type, emoji, text } or null. */
export function computeEncouragementMessage(lessonsAhead, consistency, streak, planJustChanged, shownToday) {
  if (planJustChanged) return null;
  if (shownToday) return null;
  if (lessonsAhead >= 1) {
    return { type: 'happy', emoji: '🎉', text: `Amazing! You're ${lessonsAhead} lesson${lessonsAhead > 1 ? 's' : ''} ahead of schedule! Keep it up!` };
  }
  if (streak >= 7) return { type: 'happy', emoji: '🔥', text: `Incredible ${streak}-day streak! You're on fire!` };
  if (consistency < 30) return { type: 'sad', emoji: '😔', text: `You've been a bit inconsistent. Read more today to achieve your goal!` };
  if (consistency < 60) return { type: 'neutral', emoji: '📖', text: `Keep going! You're making progress.` };
  if (consistency >= 80) return { type: 'happy', emoji: '✨', text: `Great consistency! You're doing amazing!` };
  return null;
}
