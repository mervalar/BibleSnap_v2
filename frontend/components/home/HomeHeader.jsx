import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/home/HomeHeader.styles';

const HomeHeader = ({ isConnected, user, onProfilePress, onLoginPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        {isConnected && user ? (
          <>
            <TouchableOpacity style={styles.profileCircle} onPress={onProfilePress}>
              <Text style={styles.profileInitial}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Hello, {user.name || 'User'}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.greeting}>Welcome to BibleSnap</Text>
        )}
      </View>

      {isConnected ? (
        <View style={styles.connectedActions}>
          {/* Reserved for future header actions when user is connected */}
        </View>
      ) : (
        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomeHeader;

