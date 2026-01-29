import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../styles/bIbleStudyContent.styles';

const styles = createStyles();

const UnlockModal = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.unlockModalContent}
          activeOpacity={1}
          onPress={() => {}}
        >
          <Ionicons name="lock-closed" size={28} color={COLORS.semantic.warning} style={{ marginBottom: 8 }} />
          <Text style={styles.unlockModalTitle}>Lesson Locked</Text>
          <Text style={styles.unlockModalSubtitle}>
            Complete previous lessons to unlock
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default UnlockModal;

