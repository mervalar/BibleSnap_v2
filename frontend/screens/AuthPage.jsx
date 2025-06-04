import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import styles from './../styles/Auth.styles';
const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('Login');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.17.71.194:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Login successful, navigate or store token
        navigation.navigate('Home');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://10.17.71.194:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fullName, 
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Registration successful, navigate or store token
        navigation.navigate('Home');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleGoogleLogin = () => {
   navigation.navigate('Home');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // Add your forgot password logic here
  };

  const handleCreateAccount = () => {
    setActiveTab('Register');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('Login');
  };

  const renderLoginForm = () => (
    <>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="you@email.com"
          placeholderTextColor={styles.placeholderColor.color}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor={styles.placeholderColor.color}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Remember Me and Forgot Password */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={styles.divider}>or</Text>

      {/* Google Login Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>G Continue with Google</Text>
      </TouchableOpacity>

      {/* Create Account Link */}
      <View style={styles.createAccountContainer}>
        <Text style={styles.createAccountText}>New here? </Text>
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.createAccountLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRegisterForm = () => (
    <>
      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Your full name"
          placeholderTextColor={styles.placeholderColor.color}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="you@email.com"
          placeholderTextColor={styles.placeholderColor.color}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor={styles.placeholderColor.color}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Confirm your password"
          placeholderTextColor={styles.placeholderColor.color}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
        <Text style={styles.loginButtonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={styles.divider}>or</Text>

      {/* Google Register Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>G Continue with Google</Text>
      </TouchableOpacity>

      {/* Switch to Login Link */}
      <View style={styles.createAccountContainer}>
        <Text style={styles.createAccountText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleSwitchToLogin}>
          <Text style={styles.createAccountLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Bible</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>BibleSnap</Text>
        <Text style={styles.subtitle}>
          Grow your faith. Track your journey. Stay inspired every day.
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
            onPress={() => setActiveTab('Login')}
          >
            <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Register' && styles.activeTab]}
            onPress={() => setActiveTab('Register')}
          >
            <Text style={[styles.tabText, activeTab === 'Register' && styles.activeTabText]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {activeTab === 'Login' ? renderLoginForm() : renderRegisterForm()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default LoginScreen;