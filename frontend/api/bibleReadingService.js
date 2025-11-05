// starksService.js
// const BASE_URL = 'https://biblesnap.bellatis.com/api';

// export const fetchStarks = async () => {
//   try {
//     // const response = await fetch(`${BASE_URL}/starks`);
//       const response = await axios.get('http://localhost:8000/bible-readings');

//     if (!response.ok) {
//       throw new Error('Failed to fetch starks');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching starks:', error);
//     throw error;
//   }
// };

// export const fetchRandomStudy = async () => {
//   try {
//     // const response = await fetch(`${BASE_URL}/starks/random`);
//       const response = await axios.get('http://localhost:8000/bible-readings/random');

//     if (!response.ok) {
//       throw new Error('Failed to fetch random study');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching random study:', error);
//     throw error;
//   }
// };
import axios from 'axios';

const BASE_URL = 'https://biblesnap.bellatis.com/api';

export const fetchBibleReadings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/bible-readings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bible readings:', error);
    throw error;
  }
};

export const fetchRandomStudy = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/bible-readings/random`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random study:', error);
    throw error;
  }
};