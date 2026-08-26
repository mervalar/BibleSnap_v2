import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BROWN = '#8B5D33';

const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const LEVELS = [
  'rgba(139,93,51,0.07)',   // 0 – none
  'rgba(139,93,51,0.22)',   // 1 – low
  'rgba(139,93,51,0.45)',   // 2 – medium
  'rgba(139,93,51,0.70)',   // 3 – high
  '#8B5D33',                // 4 – max
];

function level(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d = new Date()) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

async function buildActivityMap() {
  const map = {};

  try {
    const raw = await AsyncStorage.getItem('dailyReadingHistory');
    if (raw) Object.assign(map, JSON.parse(raw));
  } catch (_) {}

  try {
    const raw = await AsyncStorage.getItem('completedStudies');
    const ids = raw ? JSON.parse(raw) : [];
    for (const id of ids) {
      const ts = await AsyncStorage.getItem(`lesson_${id}_completed_date`);
      if (ts) {
        const key = toKey(new Date(parseInt(ts)));
        map[key] = (map[key] || 0) + 1;
      }
    }
  } catch (_) {}

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const chapterKeys = allKeys.filter(k => k.startsWith('bookChapter_') && k.endsWith('_date'));
    for (const k of chapterKeys) {
      const ts = await AsyncStorage.getItem(k);
      if (ts) {
        const key = toKey(new Date(parseInt(ts)));
        map[key] = (map[key] || 0) + 1;
      }
    }
  } catch (_) {}

  return map;
}

function computeStats(map, view) {
  const today = startOfDay();
  let sessions = 0;
  let activeDays = 0;

  if (view === 'month') {
    const y = today.getFullYear();
    const m = today.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const count = map[`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`] || 0;
      sessions += count;
      if (count > 0) activeDays++;
    }
  } else {
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const count = map[toKey(d)] || 0;
      sessions += count;
      if (count > 0) activeDays++;
    }
  }

  let streak = 0;
  let bestStreak = 0;
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if ((map[toKey(d)] || 0) > 0) {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }
  }

  return { sessions, activeDays, bestStreak };
}

// ── Month calendar grid ───────────────────────────────────────────
function MonthGrid({ map }) {
  const today = startOfDay();
  const y = today.getFullYear();
  const m = today.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDow = new Date(y, m, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<View key={`e${i}`} style={s.mCell} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const count = map[key] || 0;
    const lv = level(count);
    const isToday = d === today.getDate();
    cells.push(
      <View key={d} style={[s.mCell, { backgroundColor: LEVELS[lv] }, isToday && s.mCellToday]}>
        <Text style={[s.mDayNum, count > 0 && s.mDayNumActive, isToday && s.mDayNumToday]}>{d}</Text>
        {count > 0 && <Text style={s.mCount}>{count}</Text>}
      </View>
    );
  }

  return (
    <View>
      <View style={s.dowRow}>
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
          <Text key={d} style={s.dowLabel}>{d}</Text>
        ))}
      </View>
      <View style={s.mGrid}>{cells}</View>
    </View>
  );
}

// ── Year contribution grid ────────────────────────────────────────
const CELL = 11;
const GAP  = 2;

function YearGrid({ map }) {
  const today = startOfDay();
  const dow = today.getDay();
  const dowMon = dow === 0 ? 6 : dow - 1;

  const start = new Date(today);
  start.setDate(today.getDate() - dowMon - 52 * 7);

  const weeks = [];
  const cur = new Date(start);
  while (cur <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const future = cur > today;
      week.push({ key: toKey(cur), count: future ? -1 : (map[toKey(cur)] || 0) });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels = [];
  let prevM = -1;
  weeks.forEach((week, wi) => {
    const m = new Date(week[0].key + 'T00:00:00').getMonth();
    if (m !== prevM) { monthLabels.push({ wi, label: MONTH_SHORT[m] }); prevM = m; }
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ paddingBottom: 4 }}>
        {/* Month labels */}
        <View style={{ height: 14, position: 'relative', marginBottom: 4, marginLeft: 18 }}>
          {monthLabels.map(({ wi, label }) => (
            <Text key={label + wi} style={[s.yMonthLabel, { left: wi * (CELL + GAP) }]}>{label}</Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: GAP }}>
          {/* Day-of-week labels */}
          <View style={{ flexDirection: 'column', gap: GAP, marginRight: 4 }}>
            {['M','','W','','F','','S'].map((lbl, i) => (
              <Text key={i} style={[s.yDayLabel, { width: 8, height: CELL, lineHeight: CELL }]}>{lbl}</Text>
            ))}
          </View>

          {/* Cells */}
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'column', gap: GAP }}>
              {week.map((day, di) => (
                <View
                  key={di}
                  style={{
                    width: CELL, height: CELL, borderRadius: 2,
                    backgroundColor: day.count < 0 ? 'transparent' : LEVELS[level(day.count)],
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ProfileActivityGraph() {
  const [tab, setTab]           = useState('month');
  const [map, setMap]           = useState({});
  const [stats, setStats]       = useState({ sessions: 0, activeDays: 0, bestStreak: 0 });

  useEffect(() => {
    buildActivityMap().then(m => {
      setMap(m);
      setStats(computeStats(m, 'month'));
    }).catch(() => {});
  }, []);

  const switchTab = useCallback((t) => {
    setTab(t);
    setStats(computeStats(map, t));
  }, [map]);

  const today = new Date();

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>
          {tab === 'month' ? MONTH_FULL[today.getMonth()] : String(today.getFullYear())}
        </Text>
        <View style={s.tabRow}>
          {['month','year'].map(t => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabOn]} onPress={() => switchTab(t)}>
              <Text style={[s.tabTxt, tab === t && s.tabTxtOn]}>
                {t === 'month' ? 'Month' : 'Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{stats.sessions}</Text>
          <Text style={s.statLbl}>Sessions</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{stats.activeDays}</Text>
          <Text style={s.statLbl}>Active days</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{stats.bestStreak}</Text>
          <Text style={s.statLbl}>Best streak</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={s.gridWrap}>
        {tab === 'month' ? <MonthGrid map={map} /> : <YearGrid map={map} />}
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <Text style={s.legendTxt}>Less</Text>
        {LEVELS.map((c, i) => (
          <View key={i} style={[s.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={s.legendTxt}>More</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,249,242,0.96)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139,93,51,0.08)',
    borderRadius: 10,
    padding: 2,
  },
  tab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  tabOn: { backgroundColor: BROWN },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#9B8870' },
  tabTxtOn: { color: '#fff' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,93,51,0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: BROWN, marginBottom: 2 },
  statLbl: { fontSize: 10, color: '#9B8870', fontWeight: '600', letterSpacing: 0.3 },
  statDiv: { width: 1, height: 28, backgroundColor: 'rgba(139,93,51,0.15)' },

  gridWrap: { marginBottom: 10 },

  // Month
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600', color: '#C4B5A5' },
  mGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  mCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  mCellToday: { borderWidth: 1.5, borderColor: BROWN },
  mDayNum: { fontSize: 11, fontWeight: '500', color: '#C4B5A5' },
  mDayNumActive: { color: '#5C3A1E', fontWeight: '700' },
  mDayNumToday: { color: BROWN, fontWeight: '800' },
  mCount: { fontSize: 7, color: BROWN, fontWeight: '800', lineHeight: 9 },

  // Year
  yMonthLabel: { position: 'absolute', fontSize: 9, fontWeight: '600', color: '#9B8870' },
  yDayLabel: { fontSize: 8, color: '#C4B5A5', fontWeight: '500', textAlign: 'right' },

  // Legend
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  legendTxt: { fontSize: 9, color: '#C4B5A5', fontWeight: '500' },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
});
