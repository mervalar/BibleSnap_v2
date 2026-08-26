import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthModal from '../components/AuthModal';

const { width } = Dimensions.get('window');
const BROWN = '#A07553';

const SLIDES = [
  {
    icon: 'book',
    color: '#8B5D33',
    bg: 'rgba(139,93,51,0.1)',
    title: 'Read the Word',
    text: 'Explore Scripture in multiple translations and languages, anytime, anywhere.',
  },
  {
    icon: 'create',
    color: '#4A4A4A',
    bg: 'rgba(74,74,74,0.08)',
    title: 'Reflect & Journal',
    text: 'Go deeper with guided SOAP journaling — Scripture, Observation, Application, Prayer.',
  },
  {
    icon: 'leaf',
    color: '#4A7742',
    bg: 'rgba(74,119,66,0.1)',
    title: 'Apply in Real Life',
    text: 'Turn what you learn into real, trackable actions you can check in on.',
  },
  {
    icon: 'flame',
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.1)',
    title: 'Grow Every Day',
    text: 'Build a reading streak and follow a study plan made just for you.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const scrollRef = useRef(null);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true').catch(() => {});
    setShowAuth(true);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    } else {
      finishOnboarding();
    }
  };

  const handleScrollEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ImageBackground source={require('../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <View style={styles.topRow}>
        <TouchableOpacity onPress={finishOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.bg }]}>
              <Ionicons name={slide.icon} size={72} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
        <Text style={styles.nextBtnText}>{index === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      <AuthModal
        visible={showAuth}
        onClose={() => { setShowAuth(false); navigation.replace('Home'); }}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F4' },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  skipText: { fontSize: 14, fontWeight: '600', color: '#A09080' },
  scroll: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  iconCircle: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#2D2417', textAlign: 'center', marginBottom: 12 },
  text: { fontSize: 15, color: '#8B7355', textAlign: 'center', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(160,117,83,0.25)' },
  dotActive: { backgroundColor: BROWN, width: 22 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BROWN, marginHorizontal: 24, marginBottom: 24,
    paddingVertical: 16, borderRadius: 16,
    shadowColor: BROWN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
