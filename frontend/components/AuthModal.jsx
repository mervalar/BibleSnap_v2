import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const { height: screenHeight } = Dimensions.get('window');

// Configure your API base URL
const API_BASE_URL = 'http://localhost:8000/api';

export default function AuthModal({ visible, onClose, navigation }) {
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const [currentView, setCurrentView] = useState('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Animation effects
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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
  const handleAuthSuccess = async (userData, token = null) => {
    try {
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Store token if provided
      if (token) {
        await AsyncStorage.setItem('token', token);
        console.log('Token stored:', token);
      }
      
      console.log('User data stored:', userData);
      
      // Show success message
      Alert.alert('Success', 'Authentication successful!', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
          }
        }
      ]);
      
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
    setCurrentView('main');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
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
        Alert.alert('Error', result.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
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
        // Handle successful registration
        await handleAuthSuccess(result.user, result.token);
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join('\n');
          Alert.alert('Validation Error', errorMessages);
        } else {
          Alert.alert('Error', result.message || 'Registration failed');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed');
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
        Your ideas, amplified
      </Text>
      <Text style={styles.subtitle}>
        Privacy-first AI that helps you create in confidence.
      </Text>

      {/* Google Login Button */}
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
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View>

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

      <Text style={styles.privacyText}>
        By continuing, you acknowledge Anthropic's{' '}
        <Text style={styles.privacyLink}>Privacy Policy</Text>.
      </Text>
    </View>
  );

  const renderLoginView = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={[styles.forgotPasswordText, loading && styles.disabledText]}>
          Forgot password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.authButton, 
          styles.primaryButton,
          loading && styles.disabledButton
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Log in</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
        disabled={loading}
      >
        <Text style={[styles.backButtonText, loading && styles.disabledText]}>
          ← Back
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpView = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join thousands of users creating with AI</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#9CA3AF"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.authButton, 
          styles.primaryButton,
          loading && styles.disabledButton
        ]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Create account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
        disabled={loading}
      >
        <Text style={[styles.backButtonText, loading && styles.disabledText]}>
          ← Back
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
        return renderMainView();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={!loading ? handleClose : null}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnimation }],
                }
              ]}
            >
              <View style={styles.handleBar} />
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.closeButtonText, loading && styles.disabledText]}>
                  ×
                </Text>
              </TouchableOpacity>

              {getCurrentView()}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 22,
  },
  content: {
    padding: 32,
    paddingTop: 60,
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '400',
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontWeight: '400',
  },
  authButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 2,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  continueButton: {
    backgroundColor: '#A07553',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#A07553',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  privacyText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  privacyLink: {
    color: '#111827',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  backButtonText: {
    color: '#6B7280',
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