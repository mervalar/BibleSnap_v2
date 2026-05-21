const API_BASE_URL = 'https://biblesnap.bellatis.com/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      return token;
    }
    // Fallback: try to get from user object
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return parsedUser?.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Fetch all saved verses for the authenticated user
export const fetchSavedVerses = async (colorFilter = null) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    let url = `${API_BASE_URL}/saved-verses`;
    if (colorFilter) {
      url += `?color=${encodeURIComponent(colorFilter)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      throw new Error(`Failed to fetch saved verses: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching saved verses:', error);
    throw error;
  }
};

// Save or highlight a verse
export const saveVerse = async (verseData) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/saved-verses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        book: verseData.book,
        chapter: verseData.chapter,
        verse: verseData.verse,
        translation: verseData.translation || 'NLT',
        highlight_color: verseData.highlight_color || null,
        note: verseData.note || null,
        is_favorite: verseData.is_favorite || false,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save verse: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving verse:', error);
    throw error;
  }
};

// Update a saved verse (highlight color, note, or favorite status)
export const updateSavedVerse = async (verseId, updateData) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/saved-verses/${verseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        highlight_color: updateData.highlight_color,
        note: updateData.note,
        is_favorite: updateData.is_favorite,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update verse: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating saved verse:', error);
    throw error;
  }
};

// Delete a saved verse
export const deleteSavedVerse = async (verseId) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/saved-verses/${verseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete verse: ${response.status}`);
    }

    const responseText = await response.text();
    if (responseText) {
      return JSON.parse(responseText);
    }
    
    return { message: 'Verse deleted successfully' };
  } catch (error) {
    console.error('Error deleting saved verse:', error);
    throw error;
  }
};

