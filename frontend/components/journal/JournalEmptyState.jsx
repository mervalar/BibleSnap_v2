import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/JournalPage.styles';

const styles = createStyles();

export default function JournalEmptyState({ dimensions, searchQuery, activeCategory, setSearchQuery, setActiveCategory }) {
  const title = searchQuery.trim() ? 'No matches found' : activeCategory === 'All' ? 'Start your journey' : 'No entries in this category';
  const message = searchQuery.trim()
    ? `No journals found matching "${searchQuery}"`
    : activeCategory === 'All'
      ? 'Create your first journal entry to begin documenting your thoughts and experiences.'
      : `No journals found in "${activeCategory}" category. Try a different category or create a new entry.`;
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="journal-outline" size={64} color={COLORS.border.medium} />
      </View>
      <Text style={[styles.emptyTitle, { fontSize: dimensions.fontSize.subtitle }]}>{title}</Text>
      <Text style={[styles.emptyText, { fontSize: dimensions.fontSize.body }]}>{message}</Text>
      {(searchQuery.trim() || activeCategory !== 'All') && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={() => { setSearchQuery(''); setActiveCategory('All'); }}>
          <Text style={[styles.clearFiltersText, { fontSize: dimensions.fontSize.caption }]}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
