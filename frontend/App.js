import React, { useState, useEffect, useRef } from 'react';

import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import OnboardingScreen from './screens/OnboardingScreen';
import HomePage from './screens/HomePage';
import BookContent from './screens/BookContentPage';
import Profile from './screens/ProfilePage';
import Journal from './screens/JournalPage';
import WishlistPage from './screens/WishlistPage';
import ApplicationPage from './screens/ApplicationPage';
import CheckInPage from './screens/CheckInPage';
import BooksList from './screens/BooksListPage';
import BibleStudy from './screens/BibleStudyPage';
import BookChapters from './screens/ChapterListPage';
import BibleStudyContent from './screens/BibleStudyContent';
import SplashScreen from './components/SplashScreen';
import SavedVersesPage from './screens/SavedVersesPage';

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

function handleCheckInNotification(response) {
  if (response?.notification?.request?.content?.data?.type !== 'checkin') return;
  if (navigationRef.isReady()) {
    navigationRef.navigate('CheckIn');
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Home');
  const responseListener = useRef();

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('token').catch(() => null),
      AsyncStorage.getItem('hasSeenOnboarding').catch(() => null),
      Asset.loadAsync(require('./assets/bg.png')).catch(() => {}),
    ])
      .then(([, hasSeenOnboarding]) => {
        if (!hasSeenOnboarding) setInitialRoute('Onboarding');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleCheckInNotification(response);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleCheckInNotification);
    return () => {
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} duration={1500} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Journal" component={Journal} options={{ headerShown: false }} />
        <Stack.Screen name="Wishlist" component={WishlistPage} options={{ headerShown: false }} />
        <Stack.Screen name="Application" component={ApplicationPage} options={{ headerShown: false }} />
        <Stack.Screen name="CheckIn" component={CheckInPage} options={{ headerShown: false }} />
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
