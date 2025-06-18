// starksService.js
const BASE_URL = 'http://127.0.0.1:8000/api'; // Replace with your actual API URL

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