import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../../styles/JournalPage.styles';

const styles = createStyles();

export default function JournalEntryCard({ journal, dimensions, categoryColor, categoryName, onPress, onEdit, onDelete, loading }) {
  return (
    <TouchableOpacity style={[styles.entryCard, { borderLeftColor: categoryColor }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.entryHeader}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
          <Text style={[styles.categoryText, { fontSize: dimensions.fontSize.caption }]}>{categoryName}</Text>
        </View>
        <Text style={[styles.entryDate, { fontSize: dimensions.fontSize.caption }]}>{journal.date}</Text>
      </View>
      <Text style={[styles.entryTitle, { fontSize: dimensions.fontSize.subtitle }]} numberOfLines={1}>{journal.title}</Text>
      <Text style={[styles.entryContent, { fontSize: dimensions.fontSize.body }]} numberOfLines={2}>{journal.content}</Text>
      <View style={styles.entryFooter}>
        <View style={styles.verseContainer}>
          <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
          <Text style={[styles.verseText, { fontSize: dimensions.fontSize.caption }]} numberOfLines={1}>{journal.verse}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={(e) => { e.stopPropagation(); onEdit(journal); }} disabled={loading}>
            <Ionicons name="create-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={(e) => { e.stopPropagation(); onDelete(journal.id); }} disabled={loading}>
            <Ionicons name="trash-outline" size={dimensions.iconSize.small} color={COLORS.semantic.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
