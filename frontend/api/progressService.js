const BASE_URL = 'https://biblesnap.bellatis.com:/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to create headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
  'Accept': 'application/json',
});

export const saveDailyScore = async (challengeId, score) => {
  try {
    const response = await fetch(`${BASE_URL}/progress/daily-score`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        challenge_id: challengeId,
        score: score
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save score');
    }

    return data;
  } catch (error) {
    console.error('Error saving daily score:', error);
    throw error;
  }
};

export const fetchTodayProgress = async () => {
  try {
    const response = await fetch(`${BASE_URL}/progress/today`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get progress');
    }

    return data;
  } catch (error) {
    console.error('Error getting today progress:', error);
    throw error;
  }
};

export const fetchScoreHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/progress/history`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get history');
    }

    return data;
  } catch (error) {
    console.error('Error getting score history:', error);
    throw error;
  }
};