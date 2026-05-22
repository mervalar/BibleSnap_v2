import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';
import { BIBLE_CHAPTER_COUNTS } from '../../utils/bibleChapterCounts';

const styles = createStyles();

function getBookStatus(bookName, bookPlans) {
  const total = BIBLE_CHAPTER_COUNTS[bookName] || 0;
  const done = bookPlans[bookName]?.chaptersRead?.length || 0;
  if (total > 0 && done >= total) return 'completed';
  if (done > 0) return 'inProgress';
  return 'notStarted';
}

function getNodePosition(index) {
  const row = Math.floor(index / 3);
  const posInRow = index % 3;
  const isEvenRow = row % 2 === 0;
  if (isEvenRow) {
    if (posInRow === 0) return { alignSelf: 'flex-start', marginLeft: 30 };
    if (posInRow === 1) return { alignSelf: 'center' };
    return { alignSelf: 'flex-end', marginRight: 30 };
  }
  if (posInRow === 0) return { alignSelf: 'flex-end', marginRight: 30 };
  if (posInRow === 1) return { alignSelf: 'center' };
  return { alignSelf: 'flex-start', marginLeft: 30 };
}

function getNodeRotation(index) {
  const posInRow = index % 3;
  const row = Math.floor(index / 3);
  const isEvenRow = row % 2 === 0;
  if (isEvenRow) return posInRow === 0 ? '-8deg' : posInRow === 1 ? '0deg' : '8deg';
  return posInRow === 0 ? '8deg' : posInRow === 1 ? '0deg' : '-8deg';
}

export default function BookGameMap({ books = [], bookPlans = {}, onSelectBook }) {
  const dimensions = getResponsiveDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(popAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
      Animated.timing(popAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [popAnim]);

  const renderNode = ({ item, index }) => {
    const status = getBookStatus(item.name, bookPlans);
    const isCompleted = status === 'completed';
    const isInProgress = status === 'inProgress';
    const total = BIBLE_CHAPTER_COUNTS[item.name] || 0;
    const done = bookPlans[item.name]?.chaptersRead?.length || 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const positionStyle = getNodePosition(index);
    const rotation = getNodeRotation(index);
    const extraMargin = index % 3 === 2 ? 20 : 8;

    let nodeColor = COLORS.locked;
    let iconName = 'book-outline';
    if (isCompleted) { nodeColor = COLORS.semantic.success; iconName = 'checkmark'; }
    else if (isInProgress) { nodeColor = COLORS.primary; iconName = 'book'; }

    const labelColor = isCompleted || isInProgress ? COLORS.text.primary : COLORS.text.tertiary;
    const subtitleColor = isCompleted || isInProgress ? COLORS.text.secondary : COLORS.text.tertiary;

    return (
      <View style={[styles.nodeWrapper, positionStyle, { marginVertical: extraMargin }]}>
        <TouchableOpacity activeOpacity={0.75} onPress={() => onSelectBook(item)} style={styles.nodeTouchable}>
          {isInProgress && (
            <Animated.View style={[
              styles.currentNodeRing,
              { transform: [{ scale: popAnim }], borderColor: nodeColor, borderWidth: 2 },
            ]} />
          )}
          <View style={[styles.nodeExternalShadow, { backgroundColor: nodeColor }]} />
          <Animated.View style={[
            styles.nodeCircle,
            {
              backgroundColor: nodeColor,
              transform: [
                { rotate: rotation },
                { scale: isInProgress ? pulseAnim : 1 },
                { perspective: 1000 },
                { rotateX: '15deg' },
              ],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isInProgress ? 0.5 : 0.3,
              shadowRadius: isInProgress ? 16 : 12,
              elevation: isInProgress ? 20 : 15,
            },
          ]}>
            <View style={styles.nodeInnerShadow} />
            <Ionicons name={iconName} size={dimensions.iconSize.large} color="#FFFFFF" style={{ zIndex: 2 }} />
          </Animated.View>
          <View style={styles.nodeLabelContainer}>
            <Text style={[styles.nodeLabel, { color: labelColor }]}>{item.name}</Text>
            <Text numberOfLines={1} style={[styles.nodeSubtitle, { color: subtitleColor }]}>
              {done > 0 ? `${done}/${total} ch · ${pct}%` : `${total} chapters`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.gameMapWrap}>
      <FlatList
        data={books}
        renderItem={renderNode}
        keyExtractor={(item, index) => item.id?.toString() || item.name || `book_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.journeyContainer}
        initialNumToRender={18}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </View>
  );
}
