const API_BASE_URL = 'https://biblesnap.bellatis.com/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData)?.token : null;
  } catch {
    return null;
  }
};

const authHeaders = async () => {
  const token = await getAuthToken();
  return { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };
};

export const fetchNoteCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/note-categories`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export const createNoteCategory = async (name) => {
  try {
    const res = await fetch(`${API_BASE_URL}/note-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const fetchJournals = async (userId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user-notes?user_id=${userId}`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.map((j) => ({
      id: j.id,
      title: j.title,
      content: j.content,
      date: j.date,
      note_categorie_id: j.note_categorie_id,
      note_categorie_name: j.note_categorie?.name,
      stark_id: j.stark_id,
      soap_scripture: j.soap_scripture,
      soap_observation: j.soap_observation,
      soap_application: j.soap_application,
      soap_prayer: j.soap_prayer,
      status: j.status,
      is_answered: j.is_answered,
      answer_reason: j.answer_reason,
      created_at: j.created_at,
    }));
  } catch (e) {
    console.error('Error fetching journals:', e);
    throw e;
  }
};

export const createJournal = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user-notes`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error('Error creating journal:', e);
    throw e;
  }
};

export const updateJournal = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user-notes/${id}`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error('Error updating journal:', e);
    throw e;
  }
};

export const deleteJournal = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user-notes/${id}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `${res.status}`);
    }
    return true;
  } catch (e) {
    console.error('Error deleting journal:', e);
    throw e;
  }
};
