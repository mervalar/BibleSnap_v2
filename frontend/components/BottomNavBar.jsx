import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthModal from './AuthModal';

const COLORS = {
  primary: '#8B5D33',
  accent: '#4A6741',
  background: '#FFFFFF',
  text: {
    primary: '#2D2417',
    secondary: '#5A4A33',
    light: '#F7F0E3',
  },
  border: {
    light: '#E7DBC8',
    medium: '#CCBDA6',
  },
};

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const checkAuth = useCallback(() => {
    AsyncStorage.getItem('isAuthenticated').then((v) => setIsConnected(v === 'true'));
  }, []);

  useFocusEffect(useCallback(() => { checkAuth(); }, [checkAuth]));

  // Map route names to nav items
  const getCurrentRoute = () => {
    const routeName = route.name;
    // Handle nested routes
    if (routeName === 'Home' || routeName === 'HomePage') return 'home';
    if (routeName === 'BooksList' || routeName === 'BooksListPage') return 'bible';
    if (routeName === 'BookChapters' || routeName === 'ChapterListPage') return 'bible';
    if (routeName === 'BookContent' || routeName === 'BookContentPage') return 'bible';
    if (routeName === 'BibleStudy' || routeName === 'BibleStudyPage') return 'study';
    if (routeName === 'Journal' || routeName === 'JournalPage') return 'journal';
    if (routeName === 'Profile' || routeName === 'ProfilePage') return 'profile';
    if (routeName === 'BibleStudyContent') return 'study';
    return null;
  };

  const currentRoute = getCurrentRoute();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: 'Home',
    },
    {
      id: 'bible',
      label: 'Bible',
      icon: 'book-outline',
      activeIcon: 'book',
      route: 'BooksList',
    },
    {
      id: 'study',
      label: 'Study',
      icon: 'school-outline',
      activeIcon: 'school',
      route: 'BibleStudy',
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: 'journal-outline',
      activeIcon: 'journal',
      route: 'Journal',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      route: 'Profile',
    },
  ];

  const handleNavigate = (item) => {
    if (currentRoute === item.id) return;
    if (item.id !== 'home' && !isConnected) {
      setShowAuthModal(true);
      return;
    }
    navigation.navigate(item.route);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.6}
            >
              <View style={[
                styles.iconWrapper,
                isActive && styles.iconWrapperActive
              ]}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={20}
                  color={isActive ? COLORS.primary : COLORS.text.secondary}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AuthModal
        visible={showAuthModal}
        onClose={() => { setShowAuthModal(false); checkAuth(); }}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.light,
    paddingTop: 6,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 56,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(139, 93, 51, 0.1)',
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default BottomNavBar;

