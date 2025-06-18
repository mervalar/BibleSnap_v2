const API_BASE_URL = 'http://localhost:8000/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get token
const getAuthToken = async () => {
  try {
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

// Helper function to get user ID
const getUserId = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return parsedUser?.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Fetch all journals for a user
export const fetchJournals = async (userId) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/user-notes?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch journals: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match your frontend structure
    return data.map(journal => ({
      id: journal.id,
      title: journal.title,
      content: journal.content,
      date: journal.date,
      category: journal.note_categorie_id,
      note_categorie_id: journal.note_categorie_id,
      verse: journal.stark?.name || 'No verse selected',
      user_id: journal.user_id,
      stark_id: journal.stark_id,
    }));
  } catch (error) {
    console.error('Error fetching journals:', error);
    throw error;
  }
};

// Create a new journal
export const createJournal = async (journalData) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/user-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        user_id: journalData.user_id,
        note_categorie_id: journalData.note_categorie_id,
        title: journalData.title,
        content: journalData.content,
        date: journalData.date,
        stark_id: journalData.stark_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create journal: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating journal:', error);
    throw error;
  }
};

// Update an existing journal - FIXED VERSION
export const updateJournal = async (journalId, journalData) => {
  try {
    const token = await getAuthToken();
    
    console.log('Updating journal:', journalId, journalData);
    
    const response = await fetch(`${API_BASE_URL}/user-notes/${journalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        title: journalData.title,
        content: journalData.content,
        date: journalData.date,
        stark_id: journalData.stark_id,
        note_categorie_id: journalData.note_categorie_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update journal: ${response.status}`);
    }

    const updatedJournal = await response.json();
    return updatedJournal;
  } catch (error) {
    console.error('Error updating journal:', error);
    throw error;
  }
};

// Delete a journal - FIXED VERSION
export const deleteJournal = async (journalId) => {
  try {
    const token = await getAuthToken();
    
    console.log('Deleting journal:', journalId);
    
    const response = await fetch(`${API_BASE_URL}/user-notes/${journalId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete journal: ${response.status}`);
    }

    // Some APIs return empty response on successful delete
    const responseText = await response.text();
    if (responseText) {
      return JSON.parse(responseText);
    }
    
    return { message: 'Journal deleted successfully' };
  } catch (error) {
    console.error('Error deleting journal:', error);
    throw error;
  }
};

// Get journal by ID
export const getJournalById = async (journalId) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/user-notes/${journalId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch journal: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching journal:', error);
    throw error;
  }
};