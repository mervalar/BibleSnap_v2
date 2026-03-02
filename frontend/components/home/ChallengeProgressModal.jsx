import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/home/ProgressModal.styles';

const ChallengeProgressModal = ({ visible, todaysChallenge, onClose, onContinue }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.progressModalOverlay}>
        <View style={styles.progressModalContent}>
          <View style={styles.progressModalHeader}>
            <Ionicons name="stats-chart" size={32} color="#A07553" />
            <Text style={styles.progressModalTitle}>Challenge Progress</Text>
            <TouchableOpacity
              style={styles.progressModalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#9E795D" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.progressModalBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.progressModalSection}>
              <Text style={styles.progressModalSectionTitle}>Today's Challenge</Text>
              <Text style={styles.progressModalChallengeTitle}>
                {todaysChallenge?.title || "Share God's love with someone today"}
              </Text>
              {todaysChallenge?.category && (
                <View style={styles.progressModalCategory}>
                  <Text style={styles.progressModalCategoryText}>
                    {todaysChallenge.category.name}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.progressModalSection}>
              <View style={styles.progressModalStatsRow}>
                <View style={styles.progressModalStatItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color={todaysChallenge?.isCompleted ? '#4A7742' : '#9E795D'}
                  />
                  <Text style={styles.progressModalStatValue}>
                    {todaysChallenge?.isCompleted ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
                <View style={styles.progressModalStatItem}>
                  <Ionicons name="bar-chart" size={28} color="#A07553" />
                  <Text style={styles.progressModalStatValue}>
                    {todaysChallenge?.progress?.percent || 0}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressModalSection}>
              <Text style={styles.progressModalSectionTitle}>Progress Bar</Text>
              <View style={styles.progressModalProgressContainer}>
                <View style={styles.progressModalProgressBar}>
                  <View
                    style={[
                      styles.progressModalProgressFill,
                      {
                        width: todaysChallenge?.progress?.percent
                          ? `${todaysChallenge.progress.percent}%`
                          : '0%',
                        backgroundColor: todaysChallenge?.isCompleted
                          ? '#4A7742'
                          : '#A07553',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressModalProgressText}>
                  {todaysChallenge?.progress?.percent || 0}% Complete
                </Text>
              </View>
            </View>

            {todaysChallenge?.main_verse && (
              <View style={styles.progressModalSection}>
                <Text style={styles.progressModalSectionTitle}>Verse Reference</Text>
                <View style={styles.progressModalVerseContainer}>
                  <Ionicons name="book" size={20} color="#A07553" />
                  <Text style={styles.progressModalVerseText}>
                    {todaysChallenge.main_verse}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.progressModalActionButton}
              onPress={() => {
                onClose();
                onContinue();
              }}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              <Text style={styles.progressModalActionButtonText}>
                Continue Challenge
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ChallengeProgressModal;

