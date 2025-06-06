import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from './screens/LandingPage';
import HomePage from './screens/HomePage';
import Auth from './screens/AuthPage';
import BookContent from './screens/BookContentPage';
import Profile from './screens/ProfilePage';
import Journal from './screens/JournalPage';
import BooksList from './screens/BooksListPage';
import BibleStudy from './screens/BibleStudyPage';
import BookChapters from './screens/ChapterListPage';
import BibleStudyContent from './screens/BibleStudyContent';




const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" >
        <Stack.Screen 
          name="Landing" 
          component={LandingPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Auth" 
          component={Auth} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="BooksList" 
          component={BooksList} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="BibleStudy" component={BibleStudy} 
        options={{ headerShown: false }} />
        <Stack.Screen name="Journal" component={Journal} 
         options={{ headerShown: false }} 
         />
        <Stack.Screen name="BookChapters" component={BookChapters} />
        <Stack.Screen name="BookContent" component={BookContent}  options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="BibleStudyContent" component={BibleStudyContent} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}
