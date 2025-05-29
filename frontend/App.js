import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from './screens/LandingPage';
import HomePage from './screens/HomePage';
import Auth from './screens/AuthPage';
import BookContent from './screens/BookContentPage';

import Profile from './screens/ProfilePage';
import Journal from './screens/JournalPage';

import BibleStudy from './screens/BibleStudyPage';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BookContent" >
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="BibleStudy" component={BibleStudy} />
        <Stack.Screen name="Journal" component={Journal} />
        <Stack.Screen name="BookContent" component={BookContent} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}
