import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStyles, COLORS } from '../styles/bIbleStudyContent.styles';
import TypeFilterModal from './TypeFilterModal';
import StudyPlanModal from './StudyPlanModal';
import { fetchBibleReadings } from '../api/bibleReadingService';

WebBrowser.maybeCompleteAuthSession();

// Configure your API base URL
const API_BASE_URL = 'https://biblesnap.bellatis.com/api';

export default function AuthModal({ visible, onClose, navigation }) {
  const modalStyles = createStyles();
  const [currentView, setCurrentView] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New user onboarding modals
  const [showTypeFilterModal, setShowTypeFilterModal] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [selectedType, setSelectedType] = useState('historical');
  const [planDays, setPlanDays] = useState(365);
  const [startDate, setStartDate] = useState(new Date());
  const [bibleReadingsCount, setBibleReadingsCount] = useState(365);

  // Create redirect URI for Google OAuth
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'com.mer.bibleapp',
    useProxy: true,
  });

  console.log('Redirect URI being used:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '379163976655-1n874fq7bm965lkovca6d283g3oa40ip.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      additionalParameters: {},
      extraParams: {
        access_type: 'offline',
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    }
  );

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      console.log('Authentication successful! Token:', id_token);
      handleGoogleCallback(id_token || access_token);
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      Alert.alert(
        'Authentication Error', 
        response.error?.error_description || 'Authentication failed'
      );
      setLoading(false);
    } else if (response?.type === 'cancel') {
      console.log('Authentication cancelled by user');
      setLoading(false);
    }
  }, [response]);


  // API call functions
  const apiCall = async (endpoint, method = 'POST', data = null) => {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Connection test response:', response.status);
      const data = await response.json();
      console.log('Connection test data:', data);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  // Enhanced authentication success handler
  // Check if user is new (first time signup)
  const isNewUser = async () => {
    try {
      const studyPlan = await AsyncStorage.getItem('studyPlan');
      return !studyPlan; // New user if no study plan exists
    } catch (error) {
      return true; // Assume new user if error
    }
  };

  // Build schedule for study plan
  const buildSchedule = (readings, totalDays) => {
    const items = readings.slice().sort((a,b)=>a.day - b.day);
    const n = items.length;
    const base = Math.floor(n / totalDays);
    const rem = n % totalDays;
    const schedule = [];
    let idx = 0;
    for (let i = 0; i < totalDays; i++) {
      const size = base + (i < rem ? 1 : 0);
      schedule.push(items.slice(idx, idx + size).map(r => r.day));
      idx += size;
    }
    return schedule;
  };

  // Handle study plan save for new users
  const handleSavePlan = async (days, chosenStartDate) => {
    try {
      // Fetch bible readings to build schedule
      const readings = await fetchBibleReadings();
      if (!readings || readings.length === 0) {
        Alert.alert('Error', 'Unable to load Bible readings. Please try again.');
        return;
      }

      const schedule = buildSchedule(readings, days);
      const chosenStart = chosenStartDate || startDate || new Date();
      
      const plan = {
        days,
        startDate: chosenStart.toISOString(),
        schedule,
        planChangedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('studyPlan', JSON.stringify(plan));
      
      // Reset all progress for new user
      await AsyncStorage.removeItem('bibleProgress');
      await AsyncStorage.removeItem('completedStudies');
      
      // Clear all lesson completion flags
      const allKeys = await AsyncStorage.getAllKeys();
      const lessonKeys = allKeys.filter(key => key.startsWith('lesson_') && key.includes('_completed'));
      await AsyncStorage.multiRemove(lessonKeys);
      
      // Clear daily reading tracking
      await AsyncStorage.removeItem('dailyReadingHistory');
      await AsyncStorage.removeItem('readingStreak');
      await AsyncStorage.removeItem('lastReadingDate');
      
      // Close modals and navigate to Home
      setShowStudyPlanModal(false);
      setShowTypeFilterModal(false);
      handleClose();
      
      // Navigate to Home
      if (navigation) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving study plan:', error);
      Alert.alert('Error', 'Failed to save study plan. Please try again.');
    }
  };

  // Handle type filter selection
  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setShowTypeFilterModal(false);
    // After selecting type, show study plan modal
    setTimeout(() => {
      setShowStudyPlanModal(true);
    }, 300);
  };

  const handleAuthSuccess = async (userData, token = null, isSignup = false) => {
    try {
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Store token if provided
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      
      // Check if this is a new user signup
      if (isSignup) {
        const userIsNew = await isNewUser();
        if (userIsNew) {
          // Load bible readings count
          try {
            const readings = await fetchBibleReadings();
            setBibleReadingsCount(readings?.length || 365);
          } catch (error) {
            console.error('Error fetching readings count:', error);
          }
          
          // Close auth modal and show type filter modal
          handleClose();
          setTimeout(() => {
            setShowTypeFilterModal(true);
          }, 300);
          return;
        }
      }
      
      // For login or existing users, just close and navigate
      handleClose();
      if (navigation) {
        navigation.navigate('Home');
      }
      
    } catch (error) {
      console.error('Error storing user data:', error);
      Alert.alert('Error', 'Failed to save user data');
    }
  };

  const handleGoogleCallback = async (token) => {
    try {
      setLoading(true);
      
      // Decode the JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      // Call your Laravel endpoint that matches your route
      const result = await apiCall('/auth', 'POST', {
        email: payload.email,
        name: payload.name
      });

      if (result.success) {
        // Handle successful authentication
        await handleAuthSuccess(result.user, result.token || token);
      } else {
        Alert.alert('Error', result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google callback error:', error);
      Alert.alert('Error', error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setConfirmationCode('');
    setCurrentView('signup');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatLoginErrorMessage = (error, message) => {
    if (message) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('invalid') && lowerMessage.includes('credentials')) {
        return 'The email or password you entered is incorrect. Please check your credentials and try again.';
      }
      if (lowerMessage.includes('not found') || lowerMessage.includes("doesn't exist")) {
        return 'No account found with this email address. Please sign up to create an account.';
      }
      if (lowerMessage.includes('unauthorized') || lowerMessage.includes('incorrect')) {
        return 'Incorrect email or password. Please try again or use "Forgot password" if you need help.';
      }
      return message;
    }
    if (error && typeof error === 'string') {
      return error;
    }
    return 'Unable to log in. Please check your email and password, then try again.';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both your email and password to log in.');
      return;
    }

    try {
      setLoading(true);
      
      const result = await apiCall('/login', 'POST', {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (result.success) {
        // Handle successful login
        await handleAuthSuccess(result.user, result.token);
      } else {
        const errorMessage = formatLoginErrorMessage(null, result.message);
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = formatLoginErrorMessage(error, error.message);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format user-friendly error messages
  const formatErrorMessage = (error, errors) => {
    // Check for specific error cases
    if (errors) {
      // Email already exists
      if (errors.email && errors.email.some(msg => 
        msg.toLowerCase().includes('already') || 
        msg.toLowerCase().includes('taken') ||
        msg.toLowerCase().includes('exists')
      )) {
        return 'This email address is already registered. Please use a different email or try logging in instead.';
      }
      
      // Invalid email format
      if (errors.email && errors.email.some(msg => 
        msg.toLowerCase().includes('invalid') || 
        msg.toLowerCase().includes('format') ||
        msg.toLowerCase().includes('valid')
      )) {
        return 'Please enter a valid email address (e.g., yourname@example.com).';
      }
      
      // Password errors
      if (errors.password) {
        const passwordErrors = errors.password.join(' ');
        if (passwordErrors.toLowerCase().includes('minimum') || passwordErrors.toLowerCase().includes('characters')) {
          return 'Password must be at least 6 characters long. Please choose a stronger password.';
        }
        return `Password error: ${passwordErrors}`;
      }
      
      // Name errors
      if (errors.name) {
        return `Name error: ${errors.name.join(' ')}`;
      }
      
      // General validation errors - format nicely
      const allErrors = Object.entries(errors)
        .map(([field, messages]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
          return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
        })
        .join('\n');
      
      return allErrors;
    }
    
    // Check error message for common patterns
    if (error && typeof error === 'string') {
      const lowerError = error.toLowerCase();
      if (lowerError.includes('already') || lowerError.includes('taken') || lowerError.includes('exists')) {
        return 'This email address is already registered. Please use a different email or try logging in instead.';
      }
      if (lowerError.includes('invalid email') || lowerError.includes('email format')) {
        return 'Please enter a valid email address (e.g., yourname@example.com).';
      }
      return error;
    }
    
    return error || 'Something went wrong. Please check your information and try again.';
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields to create your account.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match. Please make sure both password fields are the same.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Your password must be at least 6 characters long. Please choose a longer password for better security.');
      return;
    }

    try {
      setLoading(true);
      
      const result = await apiCall('/register', 'POST', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirmation: confirmPassword
      });

      if (result.success) {
        // Handle successful registration - pass isSignup=true
        await handleAuthSuccess(result.user, result.token, true);
      } else {
        // Handle validation errors with user-friendly messages
        const errorMessage = formatErrorMessage(result.message, result.errors);
        Alert.alert('Registration Error', errorMessage);
      }
    } catch (error) {
      // Handle network or API errors
      const errorMessage = formatErrorMessage(
        error.message || error.toString(), 
        error.response?.data?.errors || null
      );
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }

    try {
      setLoading(true);
      
      const result = await apiCall('/auth/forgot-password', 'POST', {
        email: email.trim().toLowerCase()
      });

      if (result.success) {
        Alert.alert('Success', `Password reset link sent to: ${email}`);
      } else {
        Alert.alert('Error', result.message || 'Failed to send reset link');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!request) {
      Alert.alert('Error', 'Google authentication not ready');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting Google authentication...');
      const result = await promptAsync();
      console.log('Auth result:', result);
      
      if (result?.type === 'cancel') {
        Alert.alert('Cancelled', 'Authentication was cancelled');
        setLoading(false);
      }
      // Success and error cases are handled in the useEffect
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', `Authentication failed: ${error.message}`);
      setLoading(false);
    }
  };

  const renderMainView = () => (
    <View style={styles.content}>
      <Text style={styles.title}>
        BibleSnap
      </Text>
      <Text style={styles.subtitle}>
        Grow your faith. Stay inspired.
      </Text>

      {/* Google Login Button
      <TouchableOpacity
        disabled={!request || loading}
        onPress={handleGoogleAuth}
        style={[
          styles.authButton, 
          styles.googleButton,
          (!request || loading) && styles.disabledButton
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 12 }} />
        ) : (
          <Text style={styles.googleIcon}>G</Text>
        )}
        <Text style={styles.googleButtonText}>
          {loading ? 'Authenticating...' : !request ? 'Loading...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity> */}
{/* 
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View> */}

      <TextInput
        style={styles.emailInput}
        placeholder="Enter your personal or work email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.authButton, 
          styles.continueButton,
          loading && styles.disabledButton
        ]}
        onPress={() => setCurrentView('signup')}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>Continue with email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => setCurrentView('login')}
        disabled={loading}
      >
        <Text style={[styles.loginLinkText, loading && styles.disabledText]}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>

      {/* <Text style={styles.privacyText}>
        By continuing, you acknowledge Anthropic's{' '}
        <Text style={styles.privacyLink}>Privacy Policy</Text>.
      </Text> */}
    </View>
  );

  const renderLoginView = () => (
    <View style={[modalStyles.modalContent, authInputStyles.widerModal]}>
      <TouchableOpacity 
        style={authInputStyles.closeIconButton} 
        onPress={handleClose}
        disabled={loading}
      >
        <Ionicons name="close" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      
      <Text style={modalStyles.modalTitle}>Welcome back</Text>
      <Text style={modalStyles.modalSubtitle}>Log in to your account</Text>
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.text.tertiary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.text.tertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          authInputStyles.primaryButton,
          loading && authInputStyles.disabledButton
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={authInputStyles.primaryButtonText}>Log in</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={authInputStyles.loginLink}
        onPress={() => setCurrentView('signup')}
        disabled={loading}
      >
        <Text style={[authInputStyles.loginLinkText, loading && authInputStyles.disabledText]}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpView = () => (
    <View style={[modalStyles.modalContent, authInputStyles.widerModal]}>
      <TouchableOpacity 
        style={authInputStyles.closeIconButton} 
        onPress={handleClose}
        disabled={loading}
      >
        <Ionicons name="close" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      
      <Text style={modalStyles.modalTitle}>Create account</Text>
      <Text style={modalStyles.modalSubtitle}>Sign up to get started</Text>
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Full Name"
        placeholderTextColor={COLORS.text.tertiary}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!loading}
      />
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.text.tertiary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Password (min 6 characters)"
        placeholderTextColor={COLORS.text.tertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TextInput
        style={authInputStyles.input}
        placeholder="Confirm Password"
        placeholderTextColor={COLORS.text.tertiary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          authInputStyles.primaryButton,
          loading && authInputStyles.disabledButton
        ]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={authInputStyles.primaryButtonText}>Create account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={authInputStyles.loginLink}
        onPress={() => setCurrentView('login')}
        disabled={loading}
      >
        <Text style={[authInputStyles.loginLinkText, loading && authInputStyles.disabledText]}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getCurrentView = () => {
    switch (currentView) {
      case 'login':
        return renderLoginView();
      case 'signup':
        return renderSignUpView();
      default:
        return renderSignUpView();
    }
  };

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={handleClose}
      >
        <View style={modalStyles.modalOverlay}>
          <TouchableWithoutFeedback onPress={!loading ? handleClose : null}>
            <View>
              <TouchableWithoutFeedback>
                <View>
                  {getCurrentView()}
                  
                  <TouchableOpacity 
                    style={modalStyles.modalCloseButton} 
                    onPress={handleClose}
                    disabled={loading}
                  >
 
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* Type Filter Modal for new users */}
      <TypeFilterModal
        visible={showTypeFilterModal}
        onClose={() => setShowTypeFilterModal(false)}
        selectedType={selectedType}
        onSelectType={handleTypeFilter}
      />

      {/* Study Plan Modal for new users */}
      <StudyPlanModal
        visible={showStudyPlanModal}
        onClose={() => setShowStudyPlanModal(false)}
        planDays={planDays}
        startDate={startDate}
        onSavePlan={handleSavePlan}
        bibleReadingsCount={bibleReadingsCount}
      />
    </>
  );
}

// Styles for auth inputs and buttons (separate from modal styles)
const authInputStyles = StyleSheet.create({
  widerModal: {
    width: '100%',
    maxWidth: 500,
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1.5,
    borderColor: COLORS.border.light,
    fontWeight: '400',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});