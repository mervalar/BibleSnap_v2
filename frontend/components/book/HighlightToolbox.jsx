import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/BookContentPage.styles';

const HIGHLIGHT_COLORS = [
  'rgba(255, 235, 59, 0.5)',
  'rgba(129, 212, 250, 0.5)',
  'rgba(186, 255, 201, 0.5)',
  'rgba(255, 183, 197, 0.5)',
  'rgba(255, 213, 128, 0.5)',
];

const HighlightToolbox = ({ visible, onSelectColor, onClose }) => {
  if (!visible) return null;
  return (
    <View style={styles.toolboxContainer}>
      <View style={styles.toolbox}>
        <TouchableOpacity
          style={[styles.colorButton, { backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}
          onPress={() => onSelectColor(null)}
        >
          <View style={{ width: '70%', height: 2, backgroundColor: '#999', transform: [{ rotate: '-45deg' }] }} />
        </TouchableOpacity>
        {HIGHLIGHT_COLORS.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => onSelectColor(color)}
          />
        ))}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HighlightToolbox;
