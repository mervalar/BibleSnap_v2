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
  TextInput
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const { height: screenHeight } = Dimensions.get('window');

export default function AuthModal({ visible, onClose, navigation }) {
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const [currentView, setCurrentView] = useState('main'); // 'main', 'login', 'signup', 'confirm'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  // Create redirect URI for Google OAuth
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'com.mer.bibleapp',
    useProxy: true,
  });

  // Debug: Log the redirect URI
  console.log('Redirect URI being used:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '379163976655-1n874fq7bm965lkovca6d283g3oa40ip.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.Code,
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
      const { code } = response.params;
      console.log('Authentication successful! Code:', code);
      Alert.alert('Success', 'Google authentication successful!');
      handleClose(); // Close modal on success
      // Exchange code for tokens here
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      console.error('Error description:', response.params);
      Alert.alert(
        'Authentication Error', 
        `${response.error?.message || 'Authentication failed'}\n\nError: ${response.error?.error}\nDescription: ${response.error?.error_description}`
      );
    } else if (response?.type === 'cancel') {
      console.log('Authentication cancelled by user');
      Alert.alert('Cancelled', 'Authentication was cancelled');
    }
  }, [response]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setConfirmationCode('');
    setCurrentView('main');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Implement login logic here
    Alert.alert('Login', `Logging in with: ${email}`);
    // Add your login API call here
    handleClose();
  };

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Implement signup logic here
    Alert.alert('Success', 'Account created! Please check your email for confirmation.');
    setCurrentView('confirm');
  };

  const handleConfirmAccount = () => {
    if (!confirmationCode) {
      Alert.alert('Error', 'Please enter confirmation code');
      return;
    }
    // Implement confirmation logic here
    Alert.alert('Success', 'Account confirmed successfully!');
    handleClose();
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }
    // Implement forgot password logic here
    Alert.alert('Reset Password', `Password reset link sent to: ${email}`);
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('Starting Google authentication...');
      const result = await promptAsync();
      console.log('Auth result:', result);
      
      if (result?.type === 'cancel') {
        Alert.alert('Cancelled', 'Authentication was cancelled');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', `Authentication failed: ${error.message}`);
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
        disabled={!request}
        onPress={handleGoogleAuth}
        style={[styles.authButton, styles.googleButton]}
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleButtonText}>
          {!request ? 'Loading...' : 'Continue with Google'}
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
      />

      <TouchableOpacity
        style={[styles.authButton, styles.continueButton]}
        onPress={() => setCurrentView('signup')}
      >
        <Text style={styles.continueButtonText}>Continue with email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => setCurrentView('login')}
      >
        <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
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
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.authButton, styles.primaryButton]}
        onPress={handleLogin}
      >
        <Text style={styles.primaryButtonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpView = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join thousands of users creating with AI</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#9CA3AF"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.authButton, styles.primaryButton]}
        onPress={handleSignUp}
      >
        <Text style={styles.primaryButtonText}>Create account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmView = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We've sent a confirmation code to {email}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter confirmation code"
        placeholderTextColor="#9CA3AF"
        value={confirmationCode}
        onChangeText={setConfirmationCode}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.authButton, styles.primaryButton]}
        onPress={handleConfirmAccount}
      >
        <Text style={styles.primaryButtonText}>Verify account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
      >
        <Text style={styles.backButtonText}>← Back to start</Text>
      </TouchableOpacity>
    </View>
  );

  const getCurrentView = () => {
    switch (currentView) {
      case 'login':
        return renderLoginView();
      case 'signup':
        return renderSignUpView();
      case 'confirm':
        return renderConfirmView();
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
      <TouchableWithoutFeedback onPress={handleClose}>
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
              
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>×</Text>
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
});