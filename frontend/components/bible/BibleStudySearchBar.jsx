import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function BibleStudySearchBar({ visible, searchQuery, onChangeQuery, dimensions }) {
  if (!visible) return null;
  const dims = dimensions || getResponsiveDimensions();
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={dims.iconSize.small} color={COLORS.text.tertiary} />
        <TextInput
          style={[styles.searchInput, { fontSize: dims.fontSize.body }]}
          placeholder="Search studies..."
          placeholderTextColor={COLORS.text.tertiary}
          value={searchQuery}
          onChangeText={onChangeQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearSearchButton} onPress={() => onChangeQuery('')}>
            <Ionicons name="close" size={dims.iconSize.small} color={COLORS.text.light} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
