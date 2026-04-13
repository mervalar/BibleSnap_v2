import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/Auth.styles';

const API_BASE_URL = 'https://biblesnap.bellatis.com/api';

export default function AuthScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const apiCall = async (endpoint, method, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.message || data.errors?.email?.[0] || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  };

  const persistSession = async (user, token) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('isAuthenticated', 'true');
    if (token) await AsyncStorage.setItem('token', token);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.');
      return;
    }
    try {
      setLoading(true);
      const result = await apiCall('/login', 'POST', {
        email: email.trim().toLowerCase(),
        password,
      });
      if (result.success) {
        await persistSession(result.user, result.token);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      Alert.alert('Login failed', e.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password', 'Use at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const result = await apiCall('/register', 'POST', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: confirmPassword,
      });
      if (result.success) {
        await persistSession(result.user, result.token);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      Alert.alert('Sign up failed', e.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={{ alignSelf: 'flex-start', marginBottom: 16 }}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#AE796D" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>BS</Text>
            </View>
            <Text style={styles.title}>BibleSnap</Text>
            <Text style={styles.subtitle}>Sign in with your email and password</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => setMode('login')}
              disabled={loading}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => setMode('register')}
              disabled={loading}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#B5A087"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#B5A087"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#B5A087"
              secureTextEntry
              editable={!loading}
            />
          </View>

          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#B5A087"
                secureTextEntry
                editable={!loading}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
