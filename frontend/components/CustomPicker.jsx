import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomPicker = ({ 
  options, 
  selectedValue, 
  onValueChange, 
  containerStyle, 
  labelStyle, 
  dropdownStyle,
  colors = defaultColors,
  compact = false,
  icon = null
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Default colors if not provided
  const defaultColors = {
    primary: '#A07553',
    background: '#FFFFFF',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    border: {
      light: '#E0E0E0',
    },
  };
  
  const theColors = colors || defaultColors;
  
  const selectedOption = options.find(option => option.value === selectedValue) || options[0];

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={[styles.pickerButton, { borderColor: theColors.border.light }]}
        onPress={() => setModalVisible(true)}
      >
        {compact ? (
          icon || <Text style={{ color: theColors.primary }}>A</Text>
        ) : (
          <Text style={[
            styles.selectedText, 
            labelStyle,
            { color: modalVisible ? theColors.background : theColors.text.primary }
          ]}>
            {selectedOption.label}
          </Text>
        )}
        <Ionicons 
          name={modalVisible ? "chevron-up" : "chevron-down"} 
          size={compact ? 16 : 18} 
          color={modalVisible ? theColors.background : theColors.primary} 
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent, 
              dropdownStyle,
              { backgroundColor: theColors.background }
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && { backgroundColor: `${theColors.primary}20` }
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      selectedValue === item.value && { 
                        color: theColors.primary,
                        fontWeight: '600' 
                      },
                      { color: theColors.text.secondary }
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={18} color={theColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 44,
  },
  selectedText: {
    flex: 1,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    maxHeight: 300,
    borderRadius: 12,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
  },
  compactSelector: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 36,
  },
});

export default CustomPicker;
