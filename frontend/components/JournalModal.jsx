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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Color table for random assignment
const COLOR_TABLE = [
  '#E91E63', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5',
  '#FFEB3B', '#795548', '#607D8B', '#FFC107', '#009688'
];

// Default emoji table for categories without icons
const DEFAULT_EMOJIS = [
  '💝', '🙏', '💭', '💡', '⭐', '📝', '🎯', '💪', 
  '🌟', '🔥', '✨', '🎨', '📚', '🌱', '🔍'
];

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
  const [category, setCategory] = useState(initialNote?.category || '');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to assign random color and emoji to categories
  const enrichCategories = (apiCategories) => {
    return apiCategories.map((cat, index) => ({
      ...cat,
      color: cat.color || COLOR_TABLE[index % COLOR_TABLE.length],
      icon: cat.icon || DEFAULT_EMOJIS[index % DEFAULT_EMOJIS.length],
    }));
  };

  // Load categories from API
  const loadCategories = async () => {
    setLoading(true);
    try {
      const apiCategories = await fetchNoteCategories();
      const enrichedCategories = enrichCategories(apiCategories);
      setCategories(enrichedCategories);
      
      // Set default category if not already set
      if (!category && enrichedCategories.length > 0) {
        setCategory(enrichedCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories if API fails
      const fallbackCategories = [
        { id: 'reflection', name: 'Reflection', icon: '💭', color: '#FF9800' },
        { id: 'gratitude', name: 'Gratitude', icon: '💝', color: '#E91E63' },
        { id: 'prayer', name: 'Prayer', icon: '🙏', color: '#2196F3' },
        { id: 'discovery', name: 'Discovery', icon: '💡', color: '#4CAF50' },
      ];
      setCategories(fallbackCategories);
      if (!category) {
        setCategory('reflection');
      }
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
    setTitle(initialNote?.title || '');
    setContent(initialNote?.content || '');
    setCategory(initialNote?.category || (categories.length > 0 ? categories[0].id : ''));
  }, [initialNote, visible, categories]);

 // In JournalModal.jsx, replace the handleSave function
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your note.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Required Field', 'Please enter some content for your note.');
      return;
    }

    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');

      if (!isAuthenticated || !userData) {
        // If user is not authenticated, trigger auth modal
        if (onAuthRequired) onAuthRequired();
        return;
      }

      const user = JSON.parse(userData);
      const user_id = user?.id;

      if (!user_id) {
        Alert.alert('Error', 'User ID not found.');
        return;
      }

      const noteData = {
        user_id,
        title: title.trim(),
        content: content.trim(),
        note_categorie_id: category,
        date: new Date().toISOString().split('T')[0],
        stark_id: sourceType === 'bible_study' ? null : null,
      };

      const response = await fetch('http://localhost:8000/api/user-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to save note: ${response.status}`);
      }

      const savedNote = await response.json();
      onSave(savedNote);
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message);
    }
  };
  const handleClose = () => {
    setTitle('');
    setContent('');
    setCategory('');
    onClose();
  };

  const selectedCategory = categories.find(cat => cat.id === category) || categories[0];

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initialNote ? 'Edit Note' : 'New Note'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Source Indicator */}
          {sourceType === 'bible_study' && (
            <View style={styles.sourceIndicator}>
              <Text style={styles.sourceIcon}>📖</Text>
              <Text style={styles.sourceText}>From Bible Study</Text>
            </View>
          )}

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#A07553" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScrollView}
                    contentContainerStyle={styles.categoryContainer}
                  >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      { borderColor: cat.color },
                      category === cat.id && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        category === cat.id && styles.selectedCategoryName,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
             </ScrollView>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter a title for your note..."
              placeholderTextColor="#A07553"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, prayers, or insights..."
              placeholderTextColor="#A07553"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{content.length}/1000</Text>
          </View>

          {/* Preview Card */}
          {selectedCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View
                style={[
                  styles.previewCard,
                  { borderLeftColor: selectedCategory.color },
                ]}
              >
                <View style={styles.previewHeader}>
                  <View style={styles.previewCategory}>
                    <Text style={styles.previewCategoryIcon}>
                      {selectedCategory.icon}
                    </Text>
                    <Text style={styles.previewCategoryText}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                  <Text style={styles.previewDate}>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.previewTitle,
                    !title && { fontStyle: 'italic', opacity: 0.6 },
                  ]}
                >
                  {title || 'Your note title will appear here'}
                </Text>
                <Text
                  style={[
                    styles.previewContent,
                    !content && { fontStyle: 'italic', opacity: 0.6 },
                  ]}
                >
                  {content || 'Your note content will appear here...'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#A07553',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#A07553',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDBBA1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  sourceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#9E795D',
    fontWeight: '500',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#A07553',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
     paddingRight: 20,
  },
  categoryScrollView: {
  flexGrow: 0,
},
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
    minWidth: 100,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A07553',
  },
  selectedCategoryName: {
    color: 'white',
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontWeight: '500',
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    color: '#A07553',
    textAlign: 'right',
    marginTop: 8,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCategoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  previewCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A07553',
  },
  previewDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  previewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default UserNoteModal;