export const fetchStarks = async () => {
    try {
        const response = await fetch(`http://localhost:8000/api/starks`);
        if (!response.ok) {
            throw new Error('Failed to fetch starks');
        }
        const data = await response.json();
        
        // Parse related_verses if it's a string
        return data.map(stark => ({
            ...stark,
            related_verses: typeof stark.related_verses === 'string' 
                ? JSON.parse(stark.related_verses) 
                : stark.related_verses || []
        }));
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}