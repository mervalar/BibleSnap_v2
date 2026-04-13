import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { createStyles } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function VideoBackground() {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  const shouldPlay = isFocused && appState === 'active';
  const player = useVideoPlayer(require('../../assets/view.mp4'), (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();
  }, [shouldPlay, player]);

  return (
    <View style={styles.videoBackground}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />
      <View style={styles.videoOverlay} />
    </View>
  );
}
