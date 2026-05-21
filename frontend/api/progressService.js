import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://biblesnap.bellatis.com/api';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) return token;
    const userData = await AsyncStorage.getItem('user');
    if (userData) return JSON.parse(userData)?.token || null;
    return null;
  } catch {
    return null;
  }
};

const getHeaders = async () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${await getAuthToken()}`,
});

export const saveDailyScore = async (challengeId, score) => {
  try {
    const response = await fetch(`${BASE_URL}/progress/daily-score`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ challenge_id: challengeId, score }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to save score');
    return data;
  } catch (error) {
    if (__DEV__) console.error('Error saving daily score:', error);
    throw error;
  }
};

export const fetchTodayProgress = async () => {
  try {
    const response = await fetch(`${BASE_URL}/progress/today`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get progress');
    return data;
  } catch (error) {
    if (__DEV__) console.error('Error getting today progress:', error);
    throw error;
  }
};

export const fetchScoreHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/progress/history`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get history');
    return data;
  } catch (error) {
    if (__DEV__) console.error('Error getting score history:', error);
    throw error;
  }
};
