import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/bIbleStudyContent.styles';
import { BIBLE_CHAPTER_COUNTS } from '../../utils/bibleChapterCounts';
import CelebrationOverlay from './CelebrationOverlay';
import styles from '../../styles/BookPlanSheet.styles';

export default function BookPlanSheet({ visible, book, readingData, onClose, onToggleChapter }) {
  const [showCelebration, setShowCelebration] = useState(false);

  const bookName = book?.name || '';
  const total = BIBLE_CHAPTER_COUNTS[bookName] || 0;
  const doneSet = new Set(readingData?.chaptersRead || []);
  const pct = total > 0 ? Math.round((doneSet.size / total) * 100) : 0;

  const prevSizeRef = useRef(doneSet.size);

  useEffect(() => {
    const prev = prevSizeRef.current;
    const current = doneSet.size;
    if (total > 0 && current >= total && prev < total) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3200);
    }
    prevSizeRef.current = current;
  }, [doneSet.size, total]);

  // Reset celebration ref when a different book opens
  useEffect(() => {
    prevSizeRef.current = doneSet.size;
    setShowCelebration(false);
  }, [book?.name]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.bookTitle}>{bookName}</Text>
              <View style={styles.badgeRow}>
                {book?.testament && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{book.testament}</Text>
                  </View>
                )}
                {book?.category && (
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={[styles.badgeText, styles.badgeTextGreen]}>{book.category}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>{doneSet.size} of {total} chapters read</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(pct, 100)}%` }]} />
            </View>
          </View>

          {/* Chapters grid */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Chapters</Text>
              <Text style={styles.chaptersHint}>Tap a chapter to mark it as read</Text>
              <View style={styles.grid}>
                {Array.from({ length: total }, (_, i) => i + 1).map((ch) => {
                  const done = doneSet.has(ch);
                  return (
                    <TouchableOpacity
                      key={ch}
                      style={[styles.cell, done && styles.cellDone]}
                      onPress={() => onToggleChapter(bookName, ch)}
                      activeOpacity={0.7}
                    >
                      {done && <Ionicons name="checkmark" size={9} color="#fff" style={styles.cellCheck} />}
                      <Text style={[styles.cellNum, done && styles.cellNumDone]}>{ch}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* Celebration fires over the sheet inside the modal */}
        <CelebrationOverlay visible={showCelebration} />
      </View>
    </Modal>
  );
}
