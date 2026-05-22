import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/bIbleStudyContent.styles';
import { BIBLE_CHAPTER_COUNTS } from '../../utils/bibleChapterCounts';
import BookGameMap from './BookGameMap';
import styles from '../../styles/BookPickerList.styles';

const TOTAL_BIBLE_CHAPTERS = Object.values(BIBLE_CHAPTER_COUNTS).reduce((s, n) => s + n, 0);

function computeStats(bookPlans, studyPlan) {
  const totalRead = Object.values(bookPlans).reduce(
    (s, p) => s + (p?.chaptersRead?.length || 0), 0
  );
  const remaining = TOTAL_BIBLE_CHAPTERS - totalRead;
  const pct = Math.round((totalRead / TOTAL_BIBLE_CHAPTERS) * 100);

  let chaptersPerDay = null;
  let estimatedDate = null;

  if (studyPlan?.days && studyPlan?.startDate) {
    const elapsed = Math.floor(
      (Date.now() - new Date(studyPlan.startDate)) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = Math.max(studyPlan.days - elapsed, 1);
    chaptersPerDay = Math.ceil(remaining / remainingDays);
    const end = new Date(studyPlan.startDate);
    end.setDate(end.getDate() + studyPlan.days);
    estimatedDate = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return { totalRead, pct, chaptersPerDay, estimatedDate };
}

export default function BookPickerList({ books = [], bookPlans = {}, onSelectBook, searchQuery = '', studyPlan }) {
  const filtered = books.filter(
    (b) => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { totalRead, pct, chaptersPerDay, estimatedDate } = computeStats(bookPlans, studyPlan);

  const progressFooter = totalRead > 0 ? (
    <View style={styles.progressCard}>
      <View style={styles.progressCardRow}>
        <View>
          <Text style={styles.progressCardTitle}>Bible Progress</Text>
          <Text style={styles.progressCardSub}>
            {totalRead}/{TOTAL_BIBLE_CHAPTERS} chapters
            {estimatedDate ? ` · Est. ${estimatedDate}` : ''}
          </Text>
        </View>
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1 }}>
      {chaptersPerDay !== null && (
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <View style={styles.separatorContent}>
            <Ionicons name="calendar" size={14} color={COLORS.accent} />
            <Text style={styles.separatorText}>
              {chaptersPerDay} chapter{chaptersPerDay !== 1 ? 's' : ''} / day
            </Text>
          </View>
          <View style={styles.separatorLine} />
        </View>
      )}

      <BookGameMap
        books={filtered}
        bookPlans={bookPlans}
        onSelectBook={onSelectBook}
        footer={progressFooter}
      />
    </View>
  );
}
