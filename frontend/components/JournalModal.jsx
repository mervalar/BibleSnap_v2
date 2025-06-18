import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions (matching the main Journal page)
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 14,
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

// Professional color palette (matching the main Journal page)
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
};

// Enhanced color table for categories (matching the main page)
const CATEGORY_COLORS = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

// API function
export const fetchNoteCategories = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/note-categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch note categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};

const UserNoteModal = ({
  visible,
  onClose,
  onSave,
  onAuthRequired,
  initialNote = null,
  sourceType = 'manual',
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [verse, setVerse] = useState(initialNote?.verse || '');
  const [category, setCategory] = useState(initialNote?.category || initialNote?.note_categorie_id || '');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dimensions = getResponsiveDimensions();

  // Function to get category color by ID
  const getCategoryColor = (categoryId) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    return categoryIndex >= 0 ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : COLORS.primary;
  };

  // Load categories from API
  const loadCategories = async () => {
    setLoading(true);
    try {
      const apiCategories = await fetchNoteCategories();
      setCategories(apiCategories);
      
      // Set default category if not already set
      if (!category && apiCategories.length > 0) {
        setCategory(apiCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setVerse(initialNote.verse || '');
      setCategory(initialNote.category || initialNote.note_categorie_id || '');
    }
  }, [initialNote, visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your journal.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Required Field', 'Please enter some content for your journal.');
      return;
    }

    if (!category) {
      Alert.alert('Required Field', 'Please select a category for your journal.');
      return;
    }

    setSaving(true);
    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');

      if (!isAuthenticated || !userData) {
        if (onAuthRequired) onAuthRequired();
        return;
      }

      const user = JSON.parse(userData);
      const user_id = user?.id;

      if (!user_id) {
        Alert.alert('Error', 'User ID not found.');
        return;
      }

      const journalData = {
        user_id,
        title: title.trim(),
        content: content.trim(),
        verse: verse.trim(),
        note_categorie_id: category,
        date: new Date().toISOString().split('T')[0],
      };

      await onSave(journalData);
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save journal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setVerse('');
    setCategory('');
    onClose();
  };

  const selectedCategory = categories.find(cat => cat.id === category);
  const selectedCategoryColor = selectedCategory ? getCategoryColor(selectedCategory.id) : COLORS.primary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Loading overlay */}
        {saving && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
                Saving journal...
              </Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View style={[styles.header, { height: dimensions.headerHeight }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Ionicons name="close" size={dimensions.iconSize.medium} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
            {initialNote ? 'Edit Journal' : 'New Journal'}
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={[styles.saveButtonText, { fontSize: dimensions.fontSize.body }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Source Indicator */}
          {sourceType === 'bible_study' && (
            <View style={styles.sourceIndicator}>
              <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
              <Text style={[styles.sourceText, { fontSize: dimensions.fontSize.caption }]}>
                From Bible Study
              </Text>
            </View>
          )}

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Category
            </Text>
            {loading ? (
              <View style={styles.categoryLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
                  Loading categories...
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScrollView}
                contentContainerStyle={styles.categoryContainer}
              >
                {categories.map((cat) => {
                  const categoryColor = getCategoryColor(cat.id);
                  const isSelected = category === cat.id;
                  
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        { borderColor: categoryColor },
                        isSelected && { backgroundColor: categoryColor },
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <View style={[
                        styles.categoryDot, 
                        { backgroundColor: isSelected ? COLORS.background : categoryColor }
                      ]} />
                      <Text
                        style={[
                          styles.categoryName,
                          { fontSize: dimensions.fontSize.caption },
                          isSelected && styles.selectedCategoryName,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Title
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.titleInput, { fontSize: dimensions.fontSize.body }]}
                placeholder="Enter a title for your journal..."
                placeholderTextColor={COLORS.text.tertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>
            <Text style={[styles.characterCount, { fontSize: dimensions.fontSize.caption }]}>
              {title.length}/100
            </Text>
          </View>

          {/* Verse Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Bible Verse
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
              <TextInput
                style={[styles.verseInput, { fontSize: dimensions.fontSize.body }]}
                placeholder="Enter a Bible verse (optional)..."
                placeholderTextColor={COLORS.text.tertiary}
                value={verse}
                onChangeText={setVerse}
                maxLength={200}
              />
            </View>
            <Text style={[styles.characterCount, { fontSize: dimensions.fontSize.caption }]}>
              {verse.length}/200
            </Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
              Content
            </Text>
            <View style={[styles.inputContainer, styles.contentInputContainer]}>
              <TextInput
                style={[styles.contentInput, { fontSize: dimensions.fontSize.body }]}
                placeholder="Share your thoughts, prayers, or insights..."
                placeholderTextColor={COLORS.text.tertiary}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>
            <Text style={[styles.characterCount, { fontSize: dimensions.fontSize.caption }]}>
              {content.length}/1000
            </Text>
          </View>

          {/* Preview Card */}
          {selectedCategory && (title.trim() || content.trim()) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Preview
              </Text>
              <View style={[styles.previewCard, { borderLeftColor: selectedCategoryColor }]}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewCategoryContainer}>
                    <View style={[styles.previewCategoryDot, { backgroundColor: selectedCategoryColor }]} />
                    <Text style={[styles.previewCategoryText, { fontSize: dimensions.fontSize.caption }]}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                  <Text style={[styles.previewDate, { fontSize: dimensions.fontSize.caption }]}>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <Text style={[styles.previewTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                  {title.trim() || 'Your journal title'}
                </Text>

                <Text style={[styles.previewContent, { fontSize: dimensions.fontSize.body }]}>
                  {content.trim() || 'Your journal content will appear here...'}
                </Text>

                {verse.trim() && (
                  <View style={styles.previewVerseContainer}>
                    <Ionicons name="book-outline" size={dimensions.iconSize.small} color={COLORS.primary} />
                    <Text style={[styles.previewVerseText, { fontSize: dimensions.fontSize.caption }]}>
                      {verse.trim()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: dimensions.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.surfaceElevated,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  cancelButton: {
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
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 22,
    minWidth: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.md,
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDBBA1',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 12,
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
  },
  sourceText: {
    marginLeft: dimensions.spacing.sm,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  section: {
    marginVertical: dimensions.spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
  },
  categoryLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryContainer: {
    paddingRight: dimensions.spacing.md,
    gap: dimensions.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: COLORS.surfaceElevated,
    minHeight: 36,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: dimensions.spacing.xs,
  },
  categoryName: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    letterSpacing: 0.2,
  },
  selectedCategoryName: {
    color: COLORS.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  contentInputContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: dimensions.spacing.md,
  },
  titleInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  verseInput: {
    flex: 1,
    marginLeft: dimensions.spacing.sm,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  contentInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontWeight: '400',
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: dimensions.spacing.xs,
    fontWeight: '500',
  },
  previewCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: dimensions.cardPadding,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  previewCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: dimensions.spacing.sm,
  },
  previewCategoryText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewDate: {
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  previewTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    lineHeight: 24,
  },
  previewContent: {
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: dimensions.spacing.md,
  },
  previewVerseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDBBA1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  previewVerseText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
});

export default UserNoteModal;