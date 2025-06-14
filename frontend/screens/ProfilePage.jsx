import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Alert, // Added this import
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const ProfilePage = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false); // Added loading state for update

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
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(174, 121, 109, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#AE796D',
      fill: '#AE796D',
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
        // If no user data, navigate back to home or show login
        console.log('No user data found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Re-fetch user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove(['user', 'isAuthenticated', 'token']);
      console.log('User logged out from profile');
      // Navigate back to home page
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setUpdateLoading(true);
      
      console.log('Updating profile with:', { name: editName, email: editEmail });
      console.log('Using token:', userToken);

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
      console.log('Update response:', responseData);

      if (response.ok && responseData.success) {
        // Update AsyncStorage with new user data
        await AsyncStorage.setItem('user', JSON.stringify(responseData.user));
        setUser(responseData.user);
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        const errorMessage = responseData.message || 'Failed to update profile';
        console.error('Update failed:', responseData);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#AE796D" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>No user data found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{user.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user.email || 'No email'}</Text>
          
          {/* Debug info - remove in production */}
          {userToken && (
            <Text style={styles.debugText}>
              Token: {userToken.substring(0, 20)}...
            </Text>
          )}
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditName(user.name || '');
              setEditEmail(user.email || '');
              setModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TextInput
                placeholder="Name"
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                editable={!updateLoading}
              />
              <TextInput
                placeholder="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!updateLoading}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, updateLoading && styles.disabledButton]}
                  onPress={handleSaveEdit}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={updateLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>153</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>37</Text>
            <Text style={styles.statLabel}>Verses Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Journals</Text>
          </View>
        </View>

        {/* Growth Rate Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Growth Rate</Text>
            <Text style={styles.chartSubtitle}>Last 7 Days</Text>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={300}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Activity Cards */}
        <View style={styles.activitySection}>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>🔥</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Streak</Text>
              <Text style={styles.activitySubtitle}>7 days in a row</Text>
            </View>
            <View style={styles.activityBadge}>
              <Text style={styles.badgeText}>🔥</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>⚡</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Last Challenge</Text>
              <Text style={styles.activitySubtitle}>Completed yesterday</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>🎨</Text>
            </View>
            <Text style={styles.menuText}>Theme & Colors</Text>
            <Text style={styles.menuAction}>Change</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>🔊</Text>
            </View>
            <Text style={styles.menuText}>Audio Preferences</Text>
            <Text style={styles.menuAction}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <Text style={styles.menuText}>Notification</Text>
            <Text style={styles.menuAction}>Setup</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>📖</Text>
            </View>
            <Text style={styles.menuText}>Saved Verses</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>📝</Text>
            </View>
            <Text style={styles.menuText}>My Journals</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>🚪</Text>
            </View>
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#AE796D',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    fontSize: 20,
    color: '#000',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#AE796D',
    padding: 2,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    backgroundColor: '#AE796D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#AE796D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#AE796D',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingVertical: 20,
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
});

export default ProfilePage;