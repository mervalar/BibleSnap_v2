
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function BibleStudyEmptyState({ selectedType, dimensions }) {
  const dims = dimensions || getResponsiveDimensions();
  const isBooks = selectedType === 'pickupbook';
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color="rgba(247, 240, 227, 0.3)" />
      <Text style={[styles.emptyTitle, { fontSize: dims.fontSize.subtitle }]}>
        {isBooks ? 'No books found' : 'No studies found'}
      </Text>
      <Text style={[styles.emptyText, { fontSize: dims.fontSize.body }]}>
        {isBooks ? 'Try searching for a different book' : 'Start your Bible study journey today'}
      </Text>
    </View>
  );
}
