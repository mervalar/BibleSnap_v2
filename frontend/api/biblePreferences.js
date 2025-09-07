import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing Bible preferences
const KEYS = {
  LANGUAGE: 'bible_language',
  BIBLE_ID: 'bible_id',
  LAST_BOOK: 'last_book',
  LAST_CHAPTER: 'last_chapter',
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

/**
 * Store the last read book and chapter
 * @param {Object} book - Book object
 * @param {Object} chapter - Chapter object
 * @param {string} bibleId - Current Bible ID
 */
export const storeLastRead = async (book, chapter, bibleId) => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_BOOK, JSON.stringify(book));
    await AsyncStorage.setItem(KEYS.LAST_CHAPTER, JSON.stringify(chapter));
    await AsyncStorage.setItem(KEYS.BIBLE_ID, bibleId);
  } catch (error) {
    console.error('Error saving last read position:', error);
  }
};

/**
 * Get the last read book and chapter
 * @returns {Promise<{book: Object, chapter: Object, bibleId: string}>} - Last read book and chapter
 */
export const getLastRead = async () => {
  try {
    const bookJson = await AsyncStorage.getItem(KEYS.LAST_BOOK);
    const chapterJson = await AsyncStorage.getItem(KEYS.LAST_CHAPTER);
    const bibleId = await AsyncStorage.getItem(KEYS.BIBLE_ID);
    
    return {
      book: bookJson ? JSON.parse(bookJson) : null,
      chapter: chapterJson ? JSON.parse(chapterJson) : null,
      bibleId: bibleId || '65eec8e0b60e656b-01'
    };
  } catch (error) {
    console.error('Error retrieving last read position:', error);
    return { book: null, chapter: null, bibleId: '65eec8e0b60e656b-01' };
  }
};

export default {
  storeLanguagePreference,
  getLanguagePreference,
  storeLastRead,
  getLastRead
};
