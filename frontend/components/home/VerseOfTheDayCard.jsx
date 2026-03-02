import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import styles from '../../styles/home/VerseOfTheDayCard.styles';
import { TouchableOpacity } from 'react-native-gesture-handler';

const VerseOfTheDayCard = forwardRef(
  ({ verse, loading, isSharing, onCopyVerse, onShareVerse }, ref) => {
    const internalRef = useRef(null);

    useImperativeHandle(ref, () => ({
      capture: () => internalRef.current?.capture(),
    }));

    return (
      <ViewShot
        ref={internalRef}
        options={{ format: 'png', quality: 0.9 }}
        style={styles.verseCard}
      >
        {!isSharing ? (
          <Video
            source={require('../../assets/view.mp4')}
            style={styles.backgroundVideo}
            shouldPlay
            isLooping
            isMuted
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require('../../assets/images/img4.jpg')}
            style={styles.backgroundVideo}
            resizeMode="cover"
          />
        )}

        {!isSharing && <View style={styles.videoOverlay} />}

        <View style={styles.verseContent}>
          <View style={styles.verseHeader}>
            <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
            <Text style={styles.verseDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {loading ? (
            <View style={styles.verseLoadingContainer}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.verseLoadingText}>Loading today's verse...</Text>
            </View>
          ) : verse ? (
            <View style={styles.verseTextContainer}>
              <Text style={styles.verseText}>"{verse.text}"</Text>
              <View style={styles.verseRefContainer}>
                <Text style={styles.verseRef}>{verse.reference}</Text>
              </View>
              {!isSharing && (
                <View style={styles.verseIconRow}>
                  <TouchableOpacity onPress={onCopyVerse} style={styles.iconButtonRow}>
                    <Ionicons name="copy-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onShareVerse} style={styles.iconButtonRow}>
                    <Ionicons name="share-social-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.verseErrorContainer}>
              <Text style={styles.verseErrorText}>Could not load verse.</Text>
              <Text style={styles.verseErrorSubtext}>Please check your connection</Text>
            </View>
          )}
        </View>
      </ViewShot>
    );
  }
);

export default VerseOfTheDayCard;

