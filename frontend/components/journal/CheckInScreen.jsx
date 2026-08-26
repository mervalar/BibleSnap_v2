import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useJournal from '../../hooks/useJournal';
import ProgressRing from './ProgressRing';

const BROWN = '#A07553';
const PERCENT_OPTIONS = [0, 25, 50, 75, 100];
const FALLBACK_VERSE = '"Being confident of this, that he who began a good work in you will carry it on to completion." — Philippians 1:6';

export default function CheckInScreen({ navigation }) {
  const j = useJournal();
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState([]);

  // Freeze the list of applications to review once data has loaded, so
  // checking one in to 100% mid-session doesn't shift the remaining queue.
  useEffect(() => {
    if (queue === null && !j.loading) {
      setQueue(j.applications.filter((n) => (n.progress_percent ?? 0) < 100));
    }
  }, [j.loading, j.applications, queue]);

  const handleClose = () => navigation?.goBack?.();

  const handlePick = async (percent) => {
    const current = queue[index];
    if (!current) return;
    await j.updateApplicationProgress(current, percent);
    setReviewed((prev) => [...prev, { ...current, progress_percent: percent }]);
    setIndex((i) => i + 1);
  };

  if (queue === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={require('../../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BROWN} />
        </View>
      </SafeAreaView>
    );
  }

  const finished = index >= queue.length;

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={require('../../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color={BROWN} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptyText}>No applications need a check-in right now.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const withVerse = [...reviewed].reverse().find((n) => n.soap_scripture);
    const message = withVerse
      ? `"${withVerse.soap_scripture}" — from your application "${withVerse.title}"`
      : FALLBACK_VERSE;

    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={require('../../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.center}>
          <Ionicons name="heart-circle" size={72} color={BROWN} />
          <Text style={styles.finishedTitle}>Thank you for checking in!</Text>
          <Text style={styles.finishedMessage}>{message}</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleClose} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = queue[index];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color={BROWN} />
        </TouchableOpacity>
        <Text style={styles.progressLabel}>{index + 1} / {queue.length}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <ProgressRing percent={current.progress_percent ?? 0} size={72} strokeWidth={6} />
          <Text style={styles.cardTitle}>{current.title}</Text>
          {current.soap_scripture ? <Text style={styles.cardVerse}>{current.soap_scripture}</Text> : null}
          {current.content ? <Text style={styles.cardMessage}>{current.content}</Text> : null}

          <Text style={styles.pickLabel}>How far along are you?</Text>
          <View style={styles.percentRow}>
            {PERCENT_OPTIONS.map((p) => (
              <TouchableOpacity key={p} style={styles.percentBtn} onPress={() => handlePick(p)} activeOpacity={0.7}>
                <Text style={styles.percentBtnText}>{p}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 12 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  progressLabel: { fontSize: 14, fontWeight: '700', color: BROWN },
  cardWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginTop: 14 },
  cardVerse: { fontSize: 13, fontWeight: '600', color: BROWN, marginTop: 8, textAlign: 'center' },
  cardMessage: { fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center', lineHeight: 19 },
  pickLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  percentRow: { flexDirection: 'row', gap: 8 },
  percentBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: BROWN },
  percentBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center' },
  finishedTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  finishedMessage: { fontSize: 14, color: BROWN, fontStyle: 'italic', textAlign: 'center', lineHeight: 21, marginTop: 4 },
  doneButton: { backgroundColor: BROWN, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16, marginTop: 12 },
  doneButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
