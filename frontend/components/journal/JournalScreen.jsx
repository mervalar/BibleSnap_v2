import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserNoteModal from '../JournalModal';
import JournalPreview from '../JournalPreview';
import SplashScreen from '../SplashScreen';
import BottomNavBar from '../BottomNavBar';
import JournalHeader from './JournalHeader';
import JournalFilterTabs from './JournalFilterTabs';
import JournalEntryCard from './JournalEntryCard';
import JournalEmptyState from './JournalEmptyState';
import useJournal from '../../hooks/useJournal';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/JournalPage.styles';

const styles = createStyles();

export default function JournalScreen({ navigation }) {
  const journal = useJournal();
  const dimensions = getResponsiveDimensions();
  const {
    modalVisible,
    setModalVisible,
    setEditingJournal,
    categories,
    activeCategory,
    setActiveCategory,
    loading,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    previewVisible,
    setPreviewVisible,
    selectedJournal,
    editingJournal,
    getCategoryName,
    getCategoryColor,
    filteredJournals,
    handleSaveNote,
    handleViewJournal,
    handleEditJournal,
    handleDeleteJournal,
    openAddModal,
  } = journal;

  if (loading && journal.journals.length === 0) {
    return <SplashScreen onFinish={() => {}} duration={2000} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>Processing...</Text>
          </View>
        </View>
      )}

      <JournalHeader
        dimensions={dimensions}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={() => navigation?.goBack?.()}
        onAdd={openAddModal}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <JournalFilterTabs
          dimensions={dimensions}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          getCategoryColor={getCategoryColor}
        />

        {(searchQuery.trim() || activeCategory !== 'All') && (
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { fontSize: dimensions.fontSize.caption }]}>
              {filteredJournals.length} result{filteredJournals.length !== 1 ? 's' : ''}
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {activeCategory !== 'All' && ` in "${activeCategory}"`}
            </Text>
          </View>
        )}

        <View style={styles.entriesContainer}>
          {filteredJournals.length === 0 ? (
            <JournalEmptyState
              dimensions={dimensions}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              setSearchQuery={setSearchQuery}
              setActiveCategory={setActiveCategory}
            />
          ) : (
            filteredJournals.map((j) => (
              <JournalEntryCard
                key={j.id}
                journal={j}
                dimensions={dimensions}
                categoryColor={getCategoryColor(j.category || j.note_categorie_id)}
                categoryName={getCategoryName(j.category || j.note_categorie_id)}
                onPress={() => handleViewJournal(j)}
                onEdit={handleEditJournal}
                onDelete={handleDeleteJournal}
                loading={loading}
              />
            ))
          )}
        </View>
      </ScrollView>

      <UserNoteModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingJournal(null); }}
        onSave={handleSaveNote}
        onAuthRequired={() => {}}
        initialNote={editingJournal}
      />
      <JournalPreview
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        journal={selectedJournal}
        categories={categories}
        onEdit={(journal) => { setPreviewVisible(false); handleEditJournal(journal); }}
        onDelete={(journalId) => { setPreviewVisible(false); handleDeleteJournal(journalId); }}
      />
      <BottomNavBar />
    </SafeAreaView>
  );
}
