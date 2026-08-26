import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/JournalPage.styles';

const styles = createStyles();

export default function JournalHeader({ dimensions, showSearch, setShowSearch, searchQuery, setSearchQuery, onBack, title = 'My Journals' }) {
  return (
    <>
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>{title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerActionButton, showSearch && styles.headerActionButtonActive]} onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search" size={dimensions.iconSize.medium} color={showSearch ? COLORS.background : COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            <TextInput
              style={[styles.searchInput, { fontSize: dimensions.fontSize.body }]}
              placeholder="Search journals, titles, content..."
              placeholderTextColor={COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={dimensions.iconSize.small} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </>
  );
}
