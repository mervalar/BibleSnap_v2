// starksService.js
const BASE_URL = 'https://biblesnap.bellatis.com/api';

export const fetchStarks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/starks`);
    if (!response.ok) {
      throw new Error('Failed to fetch starks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching starks:', error);
    throw error;
  }
};

export const fetchRandomStudy = async () => {
  try {
    const response = await fetch(`${BASE_URL}/starks/random`);
    if (!response.ok) {
      throw new Error('Failed to fetch random study');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching random study:', error);
    throw error;
  }
};