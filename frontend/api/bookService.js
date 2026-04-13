import { Platform } from 'react-native';

const BASE_URL = "https://biblesnap.bellatis.com/api";

export const fetchBooks = async () => {
  try {
    // console.log(' books from:', `${BASE_URL}/books`);
    
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
    // console.log('Books fetched successfully:', data);
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Failed to fetch books');
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const fetchBookById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}`, {
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
    throw new Error(data.message || 'Failed to fetch book');
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

export const fetchBooksByTestament = async (testament) => {
  try {
    const response = await fetch(`${BASE_URL}/books/testament/${testament}`, {
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
    throw new Error(data.message || 'Failed to fetch books by testament');
  } catch (error) {
    console.error('Error fetching books by testament:', error);
    throw error;
  }
};

export const fetchBooksByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/books/category/${category}`, {
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
    throw new Error(data.message || 'Failed to fetch books by category');
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw error;
  }
};