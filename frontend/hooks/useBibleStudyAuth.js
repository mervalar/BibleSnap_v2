import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useBibleStudyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const checkAuth = async () => {
    try {
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      setIsAuthenticated(isAuth === 'true' && !!userData);
      if (isAuth !== 'true' || !userData) setShowAuthModal(true);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setShowAuthModal(true);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, authLoading, showAuthModal, setShowAuthModal, checkAuth };
}
