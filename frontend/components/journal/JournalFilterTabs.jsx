import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createStyles, COLORS } from '../../styles/JournalPage.styles';

const styles = createStyles();

export default function JournalFilterTabs({ dimensions, categories, activeCategory, setActiveCategory, getCategoryColor }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContentContainer}>
      <TouchableOpacity style={[styles.filterButton, activeCategory === 'All' ? styles.activeFilter : styles.inactiveFilter]} onPress={() => setActiveCategory('All')}>
        <Text style={[styles.filterText, { fontSize: dimensions.fontSize.caption }, activeCategory === 'All' ? styles.activeFilterText : styles.inactiveFilterText]}>All</Text>
      </TouchableOpacity>
      {categories.map((cat) => (
        <TouchableOpacity key={cat.id || cat.name} style={[styles.filterButton, activeCategory === cat.name ? styles.activeFilter : styles.inactiveFilter]} onPress={() => setActiveCategory(cat.name)}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(cat.id || cat.name) }]} />
          <Text style={[styles.filterText, { fontSize: dimensions.fontSize.caption }, activeCategory === cat.name ? styles.activeFilterText : styles.inactiveFilterText]}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
