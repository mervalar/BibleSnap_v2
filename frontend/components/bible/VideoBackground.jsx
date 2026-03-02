import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { createStyles } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function VideoBackground() {
  return (
    <View style={styles.videoBackground}>
      <Video
        source={require('../../assets/view.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        muted
        rate={1.0}
      />
      <View style={styles.videoOverlay} />
    </View>
  );
}
