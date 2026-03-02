import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/BookContentPage.styles';

const SIZES = [14, 16, 18, 20];
const LABELS = ['S', 'M', 'L', 'XL'];

const FontSizeOptions = ({ visible, onSelectSize, onClose }) => {
  if (!visible) return null;
  return (
    <View style={styles.fontSizeContainer}>
      <View style={styles.fontSizePanel}>
        <Text style={styles.fontSizeTitle}>Text Size</Text>
        <View style={styles.fontSizeOptions}>
          {SIZES.map((size, i) => (
            <TouchableOpacity
              key={size}
              style={[styles.fontSizeButton, { backgroundColor: 'rgba(160, 117, 83, 0.1)' }]}
              onPress={() => onSelectSize(size)}
            >
              <Text style={styles.fontSizeButtonText}>{LABELS[i]}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.closeFontSizeButton} onPress={onClose}>
          <Text style={styles.closeFontSizeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FontSizeOptions;
