import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS } from '../styles/bIbleStudyContent.styles';

const styles = createStyles();
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TypeFilterModal = ({
  visible,
  onClose,
  selectedType,
  onSelectType,
}) => {
  const filterOptions = [
    { 
      type: 'historical', 
      title: 'Historical Studies', 
      description: 'Journey through biblical events chronologically',
      icon: 'hourglass',
      iconActive: 'hourglass-outline',
      imagePosition: 'right-behind'
    },
    // TEMP: Pick a Book disabled
    // { 
    //   type: 'pickupbook', 
    //   title: 'Pick a Book', 
    //   description: 'Read any book of the Bible at your pace',
    //   icon: 'library',
    //   iconActive: 'library-outline',
    //   imagePosition: 'left-behind'
    // }
  ];

  const handleTypeSelect = (type) => {
    if (onSelectType) {
      onSelectType(type);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={[styles.modalContent, { 
            padding: 18,
            maxWidth: screenWidth * 0.9,
            maxHeight: screenHeight * 0.6,
          }]}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: -14,
              right: -14,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <View style={styles.filterModalHeader}>
              <Ionicons name="sparkles" size={28} color={COLORS.primary} />
              <Text style={[styles.modalTitle, { fontSize: 20, marginTop: 8, marginBottom: 4 }]}>
                Filter by Type
              </Text>
              <Text style={styles.filterExplanation}>
                Choose your vibe. Pick how you want to dive into the Word.
              </Text>
            </View>
            
            <View style={styles.filterCardsContainer}>
              {filterOptions.map((item) => (
                <View key={item.type} style={styles.filterCardWrapper}>
                  {/* Icon behind card on left for pickupbook */}
                  {item.imagePosition === 'left-behind' && (
                    <View style={[
                      styles.filterCardImageBehind,
                      selectedType === item.type && styles.filterCardImageBehindActive,
                    ]}>
                      <Ionicons 
                        name={selectedType === item.type ? item.icon : item.iconActive} 
                        size={40} 
                        color={selectedType === item.type ? COLORS.accent : '#6B8E6F'} 
                      />
                    </View>
                  )}
                  
                  {/* Icon behind card on right for historical */}
                  {item.imagePosition === 'right-behind' && (
                    <View style={[
                      styles.filterCardImageBehindRight,
                      selectedType === item.type && styles.filterCardImageBehindRightActive,
                    ]}>
                      <Ionicons 
                        name={selectedType === item.type ? item.icon : item.iconActive} 
                        size={40} 
                        color={selectedType === item.type ? '#D4A574' : '#B8956A'} 
                      />
                    </View>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => handleTypeSelect(item.type)}
                    style={[
                      styles.filterCard,
                      item.imagePosition === 'left-behind' && styles.filterCardPickupBook,
                      item.imagePosition === 'right-behind' && styles.filterCardHistorical,
                      selectedType === item.type && styles.filterCardActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.filterCardContent}>
                      <View style={styles.filterCardHeader}>
                        <Text style={[
                          styles.filterCardTitle,
                          selectedType === item.type && styles.filterCardTitleActive
                        ]}>
                          {item.title}
                        </Text>
                        <Ionicons 
                          name={selectedType === item.type ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={selectedType === item.type ? '#FFFFFF' : COLORS.border.medium} 
                        />
                      </View>
                      <Text style={[
                        styles.filterCardDescription,
                        selectedType === item.type && styles.filterCardDescriptionActive
                      ]}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default TypeFilterModal;

