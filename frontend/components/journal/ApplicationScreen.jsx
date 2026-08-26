import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../BottomNavBar';
import JournalHeader from './JournalHeader';
import ApplicationItemRow from './ApplicationItemRow';
import ApplicationModal from './ApplicationModal';
import useJournal from '../../hooks/useJournal';
import { COLORS } from '../../styles/theme';

const BROWN = '#A07553';
const WARNING = COLORS.semantic.warning;

const APP_FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Done' },
];

export default function ApplicationScreen({ navigation }) {
  const j = useJournal();
  const [appFilter, setAppFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    j.setActiveSection('application');
  }, []);

  const filteredApplications = j.applications.filter((n) => {
    const percent = n.progress_percent ?? 0;
    if (appFilter === 'active' && percent >= 100) return false;
    if (appFilter === 'done' && percent < 100) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return [n.title, n.soap_scripture, n.content].some((field) => field?.toLowerCase().includes(q));
  });

  const activeCount = j.applications.filter((n) => (n.progress_percent ?? 0) < 100).length;

  const renderContent = () => {
    if (j.loadError) {
      return (
        <EmptyState
          icon="construct-outline"
          tint={WARNING}
          text={`We're experiencing technical difficulties.\nWe'll be back online as soon as possible.`}
          verse={`"Wait for the Lord; be strong and take heart." — Psalm 27:14`}
          onRetry={j.retryLoad}
        />
      );
    }

    return filteredApplications.length === 0 ? (
      <EmptyState
        icon="checkmark-circle-outline"
        text={searchQuery.trim() ? `No applications match "${searchQuery.trim()}".` : `No applications yet.\nSave an action from your Journey entries.`}
      />
    ) : (
      filteredApplications.map((note) => (
        <ApplicationItemRow
          key={note.id}
          note={note}
          onEdit={() => j.openEdit(note)}
          onDelete={() => j.handleDelete(note.id)}
        />
      ))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ImageBackground source={require('../../assets/bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {j.loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BROWN} />
        </View>
      )}

      <JournalHeader
        title="Applications"
        dimensions={{ fontSize: { title: 18, body: 14, caption: 12 }, iconSize: { small: 16, medium: 20 } }}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={() => navigation?.goBack?.()}
      />

      <View style={styles.separator} />
      <View style={styles.chipRow}>
        {APP_FILTERS.map((f) => {
          const active = appFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setAppFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeCount > 0 && (
        <TouchableOpacity
          style={styles.checkInBanner}
          onPress={() => navigation.navigate('CheckIn')}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />
          <Text style={styles.checkInBannerText}>
            Check in on {activeCount} application{activeCount !== 1 ? 's' : ''}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={j.openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ApplicationModal
        visible={j.appModalVisible}
        onClose={() => { j.setAppModalVisible(false); j.setEditingNote(null); }}
        onSave={j.saveApplication}
        initialNote={j.editingNote}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}

function EmptyState({ icon, text, tint, verse, onRetry }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={tint || BROWN} style={{ opacity: tint ? 1 : 0.4 }} />
      <Text style={styles.emptyText}>{text}</Text>
      {verse && <Text style={styles.emptyVerse}>{verse}</Text>}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(160,117,83,0.15)',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(160,117,83,0.35)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  chipActive: {
    backgroundColor: BROWN,
    borderColor: BROWN,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: BROWN },
  chipTextActive: { color: '#fff' },
  checkInBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: BROWN,
  },
  checkInBannerText: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: BROWN,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 14, paddingHorizontal: 24 },
  emptyText: { color: '#999', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  emptyVerse: { color: '#B08968', fontSize: 13, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },
  retryButton: { backgroundColor: BROWN, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 14, marginTop: 4 },
  retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
