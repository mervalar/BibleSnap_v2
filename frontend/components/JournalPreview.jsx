import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions (matching your main app)
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 28 : 24,
      subtitle: isTablet ? 20 : 18,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    iconSize: {
      small: isTablet ? 20 : 16,
      medium: isTablet ? 24 : 20,
      large: isTablet ? 32 : 24,
    }
  };
};

// Professional color palette (matching your main app)
const COLORS = {
  primary: '#A07553',
  primaryLight: '#B8956D',
  primaryDark: '#8A6344',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    strong: '#B0B0B0',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  overlay: 'rgba(160, 117, 83, 0.1)',
  verse: {
    background: '#FDF6F0',
    border: '#E8D5C4',
    text: '#5D4E37',
  }
};

// Enhanced color table for categories (matching your main app)
const CATEGORY_COLORS = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

const JournalPreview = ({ 
  visible, 
  onClose, 
  journal, 
  categories = [],
  onEdit,
  onDelete 
}) => {
  const dimensions = getResponsiveDimensions();

  if (!journal) return null;

  // Function to get category color by ID or name (matching your main app)
  const getCategoryColor = (categoryIdentifier) => {
    const categoryIndex = categories.findIndex(cat => 
      cat.id === categoryIdentifier || 
      cat.name === categoryIdentifier ||
      cat.id.toString() === categoryIdentifier?.toString()
    );
    return categoryIndex >= 0 ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : COLORS.primary;
  };

  // Function to get category name from ID or return name if already a name (matching your main app)
  const getCategoryName = (categoryIdentifier) => {
    const category = categories.find(cat => 
      cat.id === categoryIdentifier || 
      cat.name === categoryIdentifier ||
      cat.id.toString() === categoryIdentifier?.toString()
    );
    return category ? category.name : categoryIdentifier;
  };

  const journalCategoryName = getCategoryName(journal.category || journal.note_categorie_id);
  const categoryColor = getCategoryColor(journal.category || journal.note_categorie_id);

  // Format date consistently
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { height: dimensions.headerHeight }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.subtitle }]}>
            Journal Entry
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => onEdit && onEdit(journal)}
            >
              <Ionicons name="create-outline" size={dimensions.iconSize.medium} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerActionButton, styles.deleteButton]}
              onPress={() => onDelete && onDelete(journal.id)}
            >
              <Ionicons name="trash-outline" size={dimensions.iconSize.medium} color={COLORS.semantic.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category and Date Header */}
          <View style={styles.entryHeader}>
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
              <Text style={[styles.categoryText, { fontSize: dimensions.fontSize.caption }]}>
                {journalCategoryName}
              </Text>
            </View>
            <Text style={[styles.dateText, { fontSize: dimensions.fontSize.caption }]}>
              {formatDate(journal.date)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { fontSize: dimensions.fontSize.title }]}>
            {journal.title}
          </Text>

          {/* Content Card */}
          <View style={[styles.contentCard, { padding: dimensions.cardPadding }]}>
            <Text style={[styles.contentText, { fontSize: dimensions.fontSize.body }]}>
              {journal.content}
            </Text>
          </View>

          {/* Verse Section */}
          {journal.verse && (
            <View style={styles.verseSection}>
              <View style={styles.verseHeader}>
                <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                <Text style={[styles.verseLabel, { fontSize: dimensions.fontSize.body }]}>
                  Bible Verse
                </Text>
              </View>
              <View style={[styles.verseCard, { padding: dimensions.cardPadding }]}>
                <Text style={[styles.verseText, { fontSize: dimensions.fontSize.body }]}>
                  {journal.verse}
                </Text>
              </View>
            </View>
          )}

          {/* Bottom spacing for better scroll experience */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: dimensions.spacing.xl,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingTop: dimensions.spacing.lg,
    paddingBottom: dimensions.spacing.md,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: dimensions.spacing.sm,
  },
  categoryText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  title: {
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 32,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.lg,
    backgroundColor: COLORS.surfaceElevated,
    letterSpacing: -0.5,
  },
  contentCard: {
    backgroundColor: COLORS.surfaceElevated,
    marginHorizontal: dimensions.spacing.md,
    marginTop: dimensions.spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  contentText: {
    color: COLORS.text.secondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  verseSection: {
    marginHorizontal: dimensions.spacing.md,
    marginTop: dimensions.spacing.lg,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  verseLabel: {
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: dimensions.spacing.sm,
    letterSpacing: 0.2,
  },
  verseCard: {
    backgroundColor: COLORS.verse.background,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.verse.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  verseText: {
    color: COLORS.verse.text,
    lineHeight: 22,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: dimensions.spacing.xl,
  },
});

export default JournalPreview;