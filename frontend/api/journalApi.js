export const fetchJournals = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/user-notes?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch journals');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    return [];
  }
};
