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
