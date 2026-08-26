import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing Bible preferences
const KEYS = {
  LANGUAGE: 'bible_language',
  BIBLE_ID: 'bible_id',
};

/**
 * Store the currently selected language
 * @param {string} language - Language code (e.g., 'english', 'french')
 * @param {string} bibleId - Bible ID for the selected language
 */
export const storeLanguagePreference = async (language, bibleId) => {
  try {
    await AsyncStorage.setItem(KEYS.LANGUAGE, language);
    await AsyncStorage.setItem(KEYS.BIBLE_ID, bibleId);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

/**
 * Get the stored language preference
 * @returns {Promise<{language: string, bibleId: string}>} - Stored language and bibleId
 */
export const getLanguagePreference = async () => {
  try {
    const language = await AsyncStorage.getItem(KEYS.LANGUAGE) || 'english';
    const bibleId = await AsyncStorage.getItem(KEYS.BIBLE_ID) || '65eec8e0b60e656b-01';
    return { language, bibleId };
  } catch (error) {
    console.error('Error retrieving language preference:', error);
    return { language: 'english', bibleId: '65eec8e0b60e656b-01' };
  }
};

export default {
  storeLanguagePreference,
  getLanguagePreference,
};
