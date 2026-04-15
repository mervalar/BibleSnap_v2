import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function BibleStudyHeader({ onBack, showSearch, onToggleSearch, dimensions }) {
  const dims = dimensions || getResponsiveDimensions();
  return (
    <View style={[styles.header, { height: dims.headerHeight }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={dims.iconSize.medium} color={COLORS.text.light} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { fontSize: dims.fontSize.title }]}>Bible Studies</Text>
      <TouchableOpacity style={[styles.headerActionButton, showSearch && styles.headerActionButtonActive]} onPress={onToggleSearch}>
        <Ionicons name="search" size={dims.iconSize.medium} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );
}
