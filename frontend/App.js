import React, { useState, useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import LandingPage from './screens/LandingPage';
import HomePage from './screens/HomePage';
import BookContent from './screens/BookContentPage';
import Profile from './screens/ProfilePage';
import Journal from './screens/JournalPage';
import BooksList from './screens/BooksListPage';
import BibleStudy from './screens/BibleStudyPage';
import BookChapters from './screens/ChapterListPage';
import BibleStudyContent from './screens/BibleStudyContent';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import SavedVersesPage from './screens/SavedVersesPage';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('token').catch(() => null),
      Asset.loadAsync(require('./assets/bg.png')).catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} duration={1500} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Journal" component={Journal} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="BooksList" component={BooksList} options={{ headerShown: false }} />
        <Stack.Screen name="BibleStudy" component={BibleStudy} options={{ headerShown: false }} />
        <Stack.Screen name="BookChapters" component={BookChapters} options={{ headerShown: false }} />
        <Stack.Screen name="BookContent" component={BookContent} options={{ headerShown: false }} />
        <Stack.Screen name="SavedVerses" component={SavedVersesPage} options={{ headerShown: false }} />
        <Stack.Screen name="BibleStudyContent" component={BibleStudyContent} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
