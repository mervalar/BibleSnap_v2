const BASE_URL = "https://biblesnap.bellatis.com/api";

export const fetchBooks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/books`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Failed to fetch books');
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};
