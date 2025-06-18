import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveDimensions = () => {
  const isTablet = screenWidth >= 768;
  
  return {
    headerHeight: isTablet ? 80 : 60,
    cardPadding: isTablet ? 24 : 16,
    fontSize: {
      title: isTablet ? 20 : 18,
      subtitle: isTablet ? 16 : 14,
      body: isTablet ? 16 : 14,
      caption: isTablet ? 14 : 12,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    iconSize: {
      small: isTablet ? 20 : 16,
      medium: isTablet ? 24 : 20,
      large: isTablet ? 32 : 24,
    }
  };
};

// Professional color palette matching your app
const COLORS = {
  primary: '#A07553',
  primaryLight: '#B8956D',
  primaryDark: '#8A6344',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    strong: '#B0B0B0',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  overlay: 'rgba(160, 117, 83, 0.1)',
  accent: '#DDBBA1',
};

const ProfilePage = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const dimensions = getResponsiveDimensions();

  // Chart data for growth rate
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2, 3, 4, 5, 6, 7, 8],
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: COLORS.surfaceElevated,
    backgroundGradientFrom: COLORS.surfaceElevated,
    backgroundGradientTo: COLORS.surfaceElevated,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(160, 117, 83, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
      fill: COLORS.primary,
    },
  };

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (isAuthenticated === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserToken(token);
        console.log('User data loaded:', parsedUser);
      } else {
        console.log('No user data found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['user', 'isAuthenticated', 'token']);
              console.log('User logged out from profile');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setUpdateLoading(true);
      
      const response = await fetch('http://localhost:8000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name: editName.trim(), 
          email: editEmail.trim() 
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        await AsyncStorage.setItem('user', JSON.stringify(responseData.user));
        setUser(responseData.user);
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        const errorMessage = responseData.message || 'Failed to update profile';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: dimensions.fontSize.body }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="person-outline" size={64} color={COLORS.border.medium} />
          </View>
          <Text style={[styles.errorTitle, { fontSize: dimensions.fontSize.subtitle }]}>
            No Profile Found
          </Text>
          <Text style={[styles.errorText, { fontSize: dimensions.fontSize.body }]}>
            Unable to load your profile data. Please try again.
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { fontSize: dimensions.fontSize.body }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading overlay */}
      {updateLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingOverlayText, { fontSize: dimensions.fontSize.body }]}>
              Updating profile...
            </Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { height: dimensions.headerHeight }]}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: dimensions.fontSize.title }]}>
          Profile
        </Text>
        <TouchableOpacity 
          style={styles.editHeaderButton}
          onPress={() => {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
            setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={dimensions.iconSize.medium} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={[styles.profileInitial, { fontSize: dimensions.fontSize.title * 1.5 }]}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.statusIndicator} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { fontSize: dimensions.fontSize.title }]}>
              {user.name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { fontSize: dimensions.fontSize.body }]}>
              {user.email || 'No email'}
            </Text>
            <View style={styles.joinedContainer}>
              <Ionicons name="calendar-outline" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
              <Text style={[styles.joinedText, { fontSize: dimensions.fontSize.caption }]}>
                Joined March 2024
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame" size={dimensions.iconSize.medium} color={COLORS.semantic.warning} />
            </View>
            <Text style={[styles.statNumber, { fontSize: dimensions.fontSize.title }]}>153</Text>
            <Text style={[styles.statLabel, { fontSize: dimensions.fontSize.caption }]}>Days Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="bookmark" size={dimensions.iconSize.medium} color={COLORS.primary} />
            </View>
            <Text style={[styles.statNumber, { fontSize: dimensions.fontSize.title }]}>37</Text>
            <Text style={[styles.statLabel, { fontSize: dimensions.fontSize.caption }]}>Verses Saved</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="journal" size={dimensions.iconSize.medium} color={COLORS.semantic.info} />
            </View>
            <Text style={[styles.statNumber, { fontSize: dimensions.fontSize.title }]}>12</Text>
            <Text style={[styles.statLabel, { fontSize: dimensions.fontSize.caption }]}>Journals</Text>
          </View>
        </View>

        {/* Growth Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { fontSize: dimensions.fontSize.subtitle }]}>
                Growth Rate
              </Text>
              <Text style={[styles.chartSubtitle, { fontSize: dimensions.fontSize.caption }]}>
                Last 7 days activity
              </Text>
            </View>
            <View style={styles.trendIndicator}>
              <Ionicons name="trending-up" size={dimensions.iconSize.small} color={COLORS.semantic.success} />
              <Text style={[styles.trendText, { fontSize: dimensions.fontSize.caption }]}>+12%</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - (dimensions.spacing.md * 4)}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Activity Cards */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
            Recent Activity
          </Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="flame" size={dimensions.iconSize.medium} color={COLORS.semantic.warning} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { fontSize: dimensions.fontSize.body }]}>
                Current Streak
              </Text>
              <Text style={[styles.activitySubtitle, { fontSize: dimensions.fontSize.caption }]}>
                7 days in a row - Keep it up!
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={[styles.streakNumber, { fontSize: dimensions.fontSize.caption }]}>🔥 7</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={dimensions.iconSize.medium} color={COLORS.semantic.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { fontSize: dimensions.fontSize.body }]}>
                Last Challenge
              </Text>
              <Text style={[styles.activitySubtitle, { fontSize: dimensions.fontSize.caption }]}>
                Completed yesterday
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.fontSize.subtitle }]}>
            Account
          </Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="bookmark" size={dimensions.iconSize.medium} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { fontSize: dimensions.fontSize.body }]}>Saved Verses</Text>
                <Text style={[styles.menuSubtext, { fontSize: dimensions.fontSize.caption }]}>37 verses saved</Text>
              </View>
              <Ionicons name="chevron-forward" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="journal" size={dimensions.iconSize.medium} color={COLORS.semantic.info} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { fontSize: dimensions.fontSize.body }]}>My Journals</Text>
                <Text style={[styles.menuSubtext, { fontSize: dimensions.fontSize.caption }]}>12 journal entries</Text>
              </View>
              <Ionicons name="chevron-forward" size={dimensions.iconSize.small} color={COLORS.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIcon, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="log-out" size={dimensions.iconSize.medium} color={COLORS.semantic.error} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { fontSize: dimensions.fontSize.body, color: COLORS.semantic.error }]}>
                  Logout
                </Text>
                <Text style={[styles.menuSubtext, { fontSize: dimensions.fontSize.caption }]}>Sign out of your account</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: dimensions.spacing.xl }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: dimensions.fontSize.title }]}>
                Edit Profile
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                disabled={updateLoading}
              >
                <Ionicons name="close" size={dimensions.iconSize.medium} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { fontSize: dimensions.fontSize.caption }]}>Full Name</Text>
              <TextInput
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
                style={[styles.input, { fontSize: dimensions.fontSize.body }]}
                editable={!updateLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { fontSize: dimensions.fontSize.caption }]}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                style={[styles.input, { fontSize: dimensions.fontSize.body }]}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!updateLoading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={updateLoading}
              >
                <Text style={[styles.cancelButtonText, { fontSize: dimensions.fontSize.body }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, updateLoading && styles.disabledButton]}
                onPress={handleSaveEdit}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={[styles.saveButtonText, { fontSize: dimensions.fontSize.body }]}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const dimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: dimensions.spacing.lg,
  },
  loadingText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.surfaceElevated,
    padding: dimensions.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: dimensions.spacing.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    marginBottom: dimensions.spacing.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  errorTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: dimensions.spacing.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.md,
    borderRadius: 24,
  },
  backButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  editHeaderButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.surfaceElevated,
    margin: dimensions.spacing.md,
    borderRadius: 16,
    padding: dimensions.cardPadding,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: dimensions.spacing.md,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surfaceElevated,
  },
  profileInitial: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.semantic.success,
    borderWidth: 2,
    borderColor: COLORS.surfaceElevated,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    color: COLORS.text.secondary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs,
    borderRadius: 12,
  },
  joinedText: {
    marginLeft: dimensions.spacing.xs,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: dimensions.spacing.md,
    gap: dimensions.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: dimensions.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dimensions.spacing.sm,
  },
  statNumber: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: dimensions.spacing.xs,
  },
  statLabel: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.surfaceElevated,
    margin: dimensions.spacing.md,
    borderRadius: 16,
    padding: dimensions.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  activitySection: {
    marginTop: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#AE796D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityBadge: {
    backgroundColor: '#A07553',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 18,
    color: '#CCC',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AE796D',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  menuAction: {
    fontSize: 14,
    color: '#A07553',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#AE796D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  sectionContainer: {
  marginHorizontal: dimensions.spacing.md,
  marginTop: dimensions.spacing.lg,
},
menuCard: {
  backgroundColor: COLORS.surfaceElevated,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
  borderWidth: 1,
  borderColor: COLORS.border.light,
  overflow: 'hidden',
},
menuContent: {
  flex: 1,
},
menuSubtext: {
  color: COLORS.text.tertiary,
  marginTop: 2,
},
menuDivider: {
  height: 1,
  backgroundColor: COLORS.border.light,
  marginLeft: 70, // Align with text content
},
trendIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.surface,
  paddingHorizontal: dimensions.spacing.sm,
  paddingVertical: dimensions.spacing.xs,
  borderRadius: 12,
},
trendText: {
  marginLeft: dimensions.spacing.xs,
  color: COLORS.semantic.success,
  fontWeight: '600',
},
streakBadge: {
  backgroundColor: COLORS.surface,
  paddingHorizontal: dimensions.spacing.sm,
  paddingVertical: dimensions.spacing.xs,
  borderRadius: 12,
},
streakNumber: {
  fontWeight: '600',
  color: COLORS.text.primary,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: dimensions.spacing.lg,
},
modalCloseButton: {
  padding: dimensions.spacing.sm,
},
inputContainer: {
  marginBottom: dimensions.spacing.md,
},
inputLabel: {
  color: COLORS.text.secondary,
  fontWeight: '500',
  marginBottom: dimensions.spacing.xs,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
input: {
  borderWidth: 1,
  borderColor: COLORS.border.light,
  borderRadius: 12,
  paddingHorizontal: dimensions.spacing.md,
  paddingVertical: dimensions.spacing.sm,
  backgroundColor: COLORS.surface,
},
modalButtons: {
  flexDirection: 'row',
  marginTop: dimensions.spacing.lg,
  gap: dimensions.spacing.sm,
},
modalButton: {
  flex: 1,
  paddingVertical: dimensions.spacing.md,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
},
});

export default ProfilePage;