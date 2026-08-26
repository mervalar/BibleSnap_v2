import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../BottomNavBar';
import JournalHeader from './JournalHeader';
import SoapJourneyModal from './SoapJourneyModal';
import SoapJourneyCard from './SoapJourneyCard';
import useJournal from '../../hooks/useJournal';
import { COLORS } from '../../styles/theme';

const BROWN = '#A07553';
const WARNING = COLORS.semantic.warning;

export default function JournalScreen({ navigation }) {
  const j = useJournal();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    j.setActiveSection('journey');
  }, []);

  const filteredJourneys = j.journeys.filter((note) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return [note.title, note.soap_scripture, note.soap_observation, note.soap_application, note.soap_prayer]
      .some((field) => field?.toLowerCase().includes(q));
  });

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

    return filteredJourneys.length === 0 ? (
      <EmptyState
        icon="map-outline"
        text={searchQuery.trim() ? `No journey entries match "${searchQuery.trim()}".` : `No journey entries yet.\nStart your first SOAP reflection.`}
      />
    ) : (
      filteredJourneys.map((note) => (
        <SoapJourneyCard
          key={note.id}
          note={note}
          onEdit={() => j.openEdit(note)}
          onDelete={() => j.handleDelete(note.id)}
          onSaveApplication={(text) => j.saveApplicationFromWishlist(text)}
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
        dimensions={{ fontSize: { title: 18, body: 14, caption: 12 }, iconSize: { small: 16, medium: 20 } }}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={() => navigation?.goBack?.()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={j.openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <SoapJourneyModal
        visible={j.journeyModalVisible}
        onClose={() => { j.setJourneyModalVisible(false); j.setEditingNote(null); }}
        onSave={j.saveJourney}
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
