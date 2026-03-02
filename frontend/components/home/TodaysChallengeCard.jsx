import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/home/ChallengeCard.styles';

const TodaysChallengeCard = ({
  todaysChallenge,
  challengeLoading,
  onCardPress,
  onProgressPress,
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateWave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateWave();
  }, [waveAnim]);

  const handleProgressPress = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (onProgressPress) {
      onProgressPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.challengeCard,
        todaysChallenge?.isCompleted && styles.challengeCardCompleted,
      ]}
      onPress={onCardPress}
      activeOpacity={0.9}
    >
      <View style={styles.waveContainer}>
        {[0, 1, 2, 3].map((index) => {
          const translateX = waveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-300 + index * 150, 300 + index * 150],
          });
          const translateY = waveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, -20, 0],
          });
          const opacity = waveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.1, 0.2, 0.1],
          });
          const scale = waveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.1, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.wave,
                {
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity,
                  left: -150 + index * 100,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={[styles.challengeHeader, { zIndex: 1 }]}>
        <View style={styles.challengeTitleRow}>
          <Text style={styles.challengeTitle}>Today's Challenge</Text>
          {todaysChallenge?.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4A7742" />
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>
        {todaysChallenge?.category && (
          <View style={styles.challengeBadge}>
            <Text style={styles.challengeBadgeText}>{todaysChallenge.category.name}</Text>
          </View>
        )}
      </View>

      {challengeLoading ? (
        <View style={[styles.challengeLoadingContainer, { zIndex: 1 }]}>
          <ActivityIndicator size="small" color="#A07553" />
          <Text style={styles.challengeLoadingText}>Loading challenge...</Text>
        </View>
      ) : (
        <>
          <Text
            style={[
              styles.challengeDesc,
              todaysChallenge?.isCompleted && styles.challengeDescCompleted,
            ]}
          >
            {todaysChallenge?.title || "Share God's love with someone today"}
          </Text>
          {todaysChallenge?.main_verse && (
            <Text style={styles.challengeVerse}>📖 {todaysChallenge.main_verse}</Text>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.progressContainer}
        onPress={handleProgressPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.progressBar,
            todaysChallenge?.isCompleted && styles.progressBarCompleted,
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: todaysChallenge?.progress?.percent
                  ? `${todaysChallenge.progress.percent}%`
                  : '0%',
                backgroundColor: todaysChallenge?.isCompleted ? '#4A7742' : '#A07553',
              },
            ]}
          />
        </View>
        <View style={styles.progressTextRow}>
          {todaysChallenge?.isCompleted ? (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#4A7742" />
              <Text style={[styles.progressText, styles.progressTextCompleted]}>
                Completed! 🎉
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.progressText}>
                {todaysChallenge?.progress?.percent
                  ? `${todaysChallenge.progress.percent}% Complete`
                  : 'Start'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#9E795D" />
            </>
          )}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default TodaysChallengeCard;

