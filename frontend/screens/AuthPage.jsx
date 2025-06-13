import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './../styles/Auth.styles';

WebBrowser.maybeCompleteAuthSession();

const AuthPage = ({ navigation }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: '379163976655-pf88omn95qf7d92upgcghhu8slh91dqj.apps.googleusercontent.com',
    expoClientId: '379163976655-1n874fq7bm965lkovca6d283g3oa40ip.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();

      // Send this to your Laravel backend to log in or register user
      const response = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('userId', data.user.id.toString());
        navigation.navigate('Home');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Google login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>BibleSnap</Text>
        <Text style={styles.subtitle}>Grow your faith. Stay inspired.</Text>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
        >
          <Text style={styles.googleButtonText}>G Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AuthPage;
