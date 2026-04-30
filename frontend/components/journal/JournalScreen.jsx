import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../BottomNavBar';
import JournalHeader from './JournalHeader';
import JournalFilterTabs from './JournalFilterTabs';
import SoapJourneyModal from './SoapJourneyModal';
import SoapJourneyCard from './SoapJourneyCard';
import ApplicationItemRow from './ApplicationItemRow';
import ApplicationModal from './ApplicationModal';
import WishlistItemCard from './WishlistItemCard';
import WishlistModal from './WishlistModal';
import useJournal from '../../hooks/useJournal';

const BROWN = '#A07553';
const BG = '#FAF7F4';

export default function JournalScreen({ navigation }) {
  const j = useJournal();

  const renderContent = () => {
    if (j.activeSection === 'journey') {
      return j.journeys.length === 0 ? (
        <EmptyState icon="map-outline" text={`No journey entries yet.\nStart your first SOAP reflection.`} />
      ) : (
        j.journeys.map((note) => (
          <SoapJourneyCard
            key={note.id}
            note={note}
            onEdit={() => j.openEdit(note)}
            onDelete={() => j.handleDelete(note.id)}
            onSaveApplication={(text) => j.saveApplicationFromWishlist(text)}
          />
        ))
      );
    }

    if (j.activeSection === 'application') {
      return j.applications.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" text={`No applications yet.\nSave an action from your Journey entries.`} />
      ) : (
        j.applications.map((note) => (
          <ApplicationItemRow
            key={note.id}
            note={note}
            onStatusChange={(s) => j.updateApplicationStatus(note, s)}
            onEdit={() => j.openEdit(note)}
            onDelete={() => j.handleDelete(note.id)}
          />
        ))
      );
    }

    return j.wishlists.length === 0 ? (
      <EmptyState icon="heart-outline" text={`No wishlist entries yet.\nRecord a testimony or faith goal.`} />
    ) : (
      j.wishlists.map((note) => (
        <WishlistItemCard
          key={note.id}
          note={note}
          onMarkAnswered={(reason) => j.markWishlistAnswered(note, reason)}
          onSaveToApplication={(text) => j.saveApplicationFromWishlist(text)}
          onEdit={() => j.openEdit(note)}
          onDelete={() => j.handleDelete(note.id)}
        />
      ))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {j.loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BROWN} />
        </View>
      )}

      <JournalHeader
        dimensions={{ fontSize: { title: 18, body: 14, caption: 12 }, iconSize: { small: 16, medium: 20 } }}
        showSearch={false}
        setShowSearch={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
        onBack={() => navigation?.goBack?.()}
        onAdd={j.openAdd}
      />

      <JournalFilterTabs activeSection={j.activeSection} onSelect={j.setActiveSection} />

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
      <ApplicationModal
        visible={j.appModalVisible}
        onClose={() => { j.setAppModalVisible(false); j.setEditingNote(null); }}
        onSave={j.saveApplication}
        initialNote={j.editingNote}
      />
      <WishlistModal
        visible={j.wishlistModalVisible}
        onClose={() => { j.setWishlistModalVisible(false); j.setEditingNote(null); }}
        onSave={j.saveWishlist}
        initialNote={j.editingNote}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}

function EmptyState({ icon, text }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={BROWN} style={{ opacity: 0.4 }} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  fab: {
    position: 'absolute', bottom: 80, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: BROWN,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText: { color: '#999', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
