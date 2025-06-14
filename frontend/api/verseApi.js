export const fetchVerseOfTheDay = async () => {
  try {
    const response = await fetch('https://beta.ourmanna.com/api/v1/get?format=json');
    const data = await response.json();
    return data.verse.details;
  } catch (error) {
    console.error('Failed to fetch verse:', error);
    throw error;
  }
};