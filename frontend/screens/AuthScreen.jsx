import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '689137632827-cjeig6vg1eaqs2kg2dngr6lsbfqnvlcg.apps.googleusercontent.com',
    webClientId: '689137632827-cjeig6vg1eaqs2kg2dngr6lsbfqnvlcg.apps.googleusercontent.com',
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Optional
    // iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      
      // Send the access token to your Laravel backend
      axios.post('http://localhost:8000/auth/google', {
        token: authentication.accessToken,
      })
      .then(response => {
        console.log('Authentication successful', response.data);
      })
      .catch(error => {
        console.log('Error sending token to backend', error);
      });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in with Google</Text>
      <Button
        title="Sign in with Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default AuthScreen;