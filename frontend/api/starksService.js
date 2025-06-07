export const fetchStarks = async () => {
    try {
        const response = await fetch(`http://localhost:8000/api/starks`);
        if (!response.ok) {
        throw new Error('Failed to fetch starks');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
    }