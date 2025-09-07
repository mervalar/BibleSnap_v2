export const fetchCategories = async () => {
  try {
    const response = await fetch(`https://biblesnap.bellatis.com/api/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};