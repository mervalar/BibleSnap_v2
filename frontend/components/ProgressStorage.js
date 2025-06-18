// utils/progressStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProgressStorage = {
  // Save progress for a specific challenge
  async saveProgress(challengeId, progressData) {
    try {
      const key = `challenge_progress_${challengeId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        ...progressData,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Get progress for a specific challenge
  async getProgress(challengeId) {
    try {
      const key = `challenge_progress_${challengeId}`;
      const progress = await AsyncStorage.getItem(key);
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  },

  // Get all challenge progress
  async getAllProgress() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('challenge_progress_'));
      const progressData = await AsyncStorage.multiGet(progressKeys);
      
      const allProgress = {};
      progressData.forEach(([key, value]) => {
        const challengeId = key.replace('challenge_progress_', '');
        allProgress[challengeId] = JSON.parse(value);
      });
      
      return allProgress;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  },

  // Clear progress for a specific challenge
  async clearProgress(challengeId) {
    try {
      const key = `challenge_progress_${challengeId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }
};

// components/ProgressMap.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { ProgressStorage } from '../utils/progressStorage';

const { width } = Dimensions.get('window');

const ProgressMap = ({ challenges, onChallengeSelect, visible, onClose }) => {
  const [progressData, setProgressData] = useState({});
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    loadProgressData();
  }, [visible]);

  const loadProgressData = async () => {
    const allProgress = await ProgressStorage.getAllProgress();
    setProgressData(allProgress);
  };

  const getChallengeProgress = (challengeId) => {
    return progressData[challengeId] || { completedSteps: [], currentStep: 0, progress: 0 };
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return '#f0f0f0';
    if (progress < 25) return '#ffeb3b';
    if (progress < 50) return '#ff9800';
    if (progress < 75) return '#2196f3';
    if (progress < 100) return '#4caf50';
    return '#8bc34a';
  };

  const getProgressIcon = (progress) => {
    if (progress === 0) return '🔒';
    if (progress < 25) return '🌱';
    if (progress < 50) return '🌿';
    if (progress < 75) return '🌳';
    if (progress < 100) return '⭐';
    return '🏆';
  };

  const handleChallengePress = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleStartContinue = () => {
    if (selectedChallenge) {
      onChallengeSelect(selectedChallenge);
      setSelectedChallenge(null);
      onClose();
    }
  };

  const renderChallengeNode = (challenge, index) => {
    const progress = getChallengeProgress(challenge.id);
    const progressPercent = progress.progress || 0;
    const isCompleted = progressPercent === 100;
    const isStarted = progressPercent > 0;

    // Create a path layout for the map
    const row = Math.floor(index / 3);
    const col = index % 3;
    const isEvenRow = row % 2 === 0;
    const x = isEvenRow ? col * 100 : (2 - col) * 100; // Zigzag pattern
    const y = row * 120;

    return (
      <View key={challenge.id} style={[styles.challengeNode, { left: x, top: y }]}>
        {/* Connection line to next challenge */}
        {index < challenges.length - 1 && (
          <View style={[
            styles.connectionLine,
            isCompleted ? styles.connectionLineCompleted : null,
            { 
              width: col === 2 ? 60 : 80,
              transform: [{ rotate: col === 2 ? '90deg' : '0deg' }]
            }
          ]} />
        )}

        <TouchableOpacity
          style={[
            styles.challengeCircle,
            { backgroundColor: getProgressColor(progressPercent) },
            isCompleted && styles.challengeCompleted,
            isStarted && !isCompleted && styles.challengeInProgress,
          ]}
          onPress={() => handleChallengePress(challenge)}
        >
          <Text style={styles.challengeIcon}>
            {getProgressIcon(progressPercent)}
          </Text>
          <Text style={styles.challengeNumber}>{index + 1}</Text>
          
          {progressPercent > 0 && (
            <View style={styles.progressIndicator}>
              <View style={[
                styles.progressFill,
                { width: `${progressPercent}%` }
              ]} />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.challengeTitle} numberOfLines={2}>
          {challenge.title}
        </Text>
        
        {isStarted && (
          <Text style={styles.progressText}>
            {Math.round(progressPercent)}%
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Challenge Progress Map</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mapContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.mapContent}>
              {challenges.map((challenge, index) => renderChallengeNode(challenge, index))}
            </View>
          </ScrollView>

          {/* Challenge Detail Modal */}
          <Modal visible={!!selectedChallenge} transparent animationType="fade">
            <View style={styles.detailOverlay}>
              <View style={styles.detailContent}>
                {selectedChallenge && (
                  <>
                    <Text style={styles.detailTitle}>{selectedChallenge.title}</Text>
                    <Text style={styles.detailCategory}>
                      {selectedChallenge.category?.name || 'Daily Challenge'}
                    </Text>
                    
                    {selectedChallenge.description && (
                      <Text style={styles.detailDescription}>
                        {selectedChallenge.description}
                      </Text>
                    )}
                    
                    {selectedChallenge.main_verse && (
                      <Text style={styles.detailVerse}>
                        📖 {selectedChallenge.main_verse}
                      </Text>
                    )}

                    <View style={styles.progressSummary}>
                      <Text style={styles.progressSummaryTitle}>Your Progress</Text>
                      <View style={styles.progressBar}>
                        <View style={[
                          styles.progressBarFill,
                          { width: `${getChallengeProgress(selectedChallenge.id).progress || 0}%` }
                        ]} />
                      </View>
                      <Text style={styles.progressPercentText}>
                        {Math.round(getChallengeProgress(selectedChallenge.id).progress || 0)}% Complete
                      </Text>
                    </View>

                    <View style={styles.detailActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setSelectedChallenge(null)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleStartContinue}
                      >
                        <Text style={styles.continueButtonText}>
                          {getChallengeProgress(selectedChallenge.id).progress > 0 ? 'Continue' : 'Start'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    height: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#9E795D',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContent: {
    position: 'relative',
    padding: 20,
    paddingBottom: 100,
    minHeight: 600,
  },
  challengeNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  connectionLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#ddd',
    top: 30,
    left: 40,
    zIndex: 1,
  },
  connectionLineCompleted: {
    backgroundColor: '#4caf50',
  },
  challengeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ddd',
    position: 'relative',
    zIndex: 2,
  },
  challengeCompleted: {
    borderColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  challengeInProgress: {
    borderColor: '#ff9800',
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  challengeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  challengeNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  progressIndicator: {
    position: 'absolute',
    bottom: -5,
    left: 5,
    right: 5,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  challengeTitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailCategory: {
    fontSize: 14,
    color: '#9E795D',
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailVerse: {
    fontSize: 12,
    color: '#9E795D',
    fontStyle: 'italic',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  progressSummary: {
    marginBottom: 24,
  },
  progressSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 12,
    color: '#666',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#9E795D',
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProgressMap;