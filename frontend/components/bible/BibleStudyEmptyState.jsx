
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, getResponsiveDimensions, COLORS } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

export default function BibleStudyEmptyState({ selectedType, dimensions, technicalError, onRetry }) {
  const dims = dimensions || getResponsiveDimensions();
  const isBooks = selectedType === 'pickupbook';

  if (technicalError) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="construct-outline" size={64} color={COLORS.semantic.warning} />
        <Text style={[styles.emptyTitle, { fontSize: dims.fontSize.subtitle }]}>
          We're experiencing technical difficulties
        </Text>
        <Text style={[styles.emptyText, { fontSize: dims.fontSize.body }]}>
          Our team is already working on it. We'll be back online as soon as possible — thank you for your patience.
        </Text>
        <Text style={[styles.emptyText, { fontSize: dims.fontSize.caption, fontStyle: 'italic', marginTop: 8 }]}>
          "Wait for the Lord; be strong and take heart." — Psalm 27:14
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.emptyRetryButton} onPress={onRetry} activeOpacity={0.85}>
            <Text style={styles.emptyRetryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

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
