import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import SplashScreen from './components/SplashScreen'; 
import AuthScreen from './screens/AuthScreen';
import SavedVersesPage from './screens/SavedVersesPage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Color palette matching your design
const COLORS = {
  primary: '#A07553',
  secondary: '#9E795D',
  background: '#EEDED2',
  surface: '#FAFAFA',
  text: {
    primary: '#2D2417',
    secondary: '#5A4A33',
    light: '#F7F0E3',
  },
  tabBar: {
    active: '#A07553',
    inactive: '#9E795D',
    background: '#FFFFFF',
  }
};

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BibleTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'StudyTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'JournalTab') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons 
                name={iconName} 
                size={size} 
                color={color}
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.tabBar.active,
        tabBarInactiveTintColor: COLORS.tabBar.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomePage}
        options={{ 
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="BibleTab" 
        component={BooksList}
        options={{ 
          tabBarLabel: 'Bible',
        }}
      />
      <Tab.Screen 
        name="StudyTab" 
        component={BibleStudy}
        options={{ 
          tabBarLabel: 'Study',
        }}
      />
      <Tab.Screen 
        name="JournalTab" 
        component={Journal}
        options={{ 
          tabBarLabel: 'Journal',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile}
        options={{ 
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingPage} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      <Stack.Screen name="BookChapters" component={BookChapters} />
      <Stack.Screen name="BookContent" component={BookContent} />
      <Stack.Screen name="SavedVerses" component={SavedVersesPage} />
      <Stack.Screen name="BibleStudyContent" component={BibleStudyContent} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} duration={3000} />;
  }

  // Show main navigation after splash screen
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar.background,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(160, 117, 83, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.tabBar.active,
  },
});