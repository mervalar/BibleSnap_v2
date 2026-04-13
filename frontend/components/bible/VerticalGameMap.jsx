import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, COLORS, getResponsiveDimensions } from '../../styles/bIbleStudyContent.styles';

const styles = createStyles();

function getStatus(item, index, items, progressMap, completedSet) {
  if (item.id && item.id.toString().startsWith('book_')) {
    const prog = progressMap[item.id] || 0;
    return completedSet.has(item.id) || prog === 100 ? 'completed' : 'current';
  }
  const prog = progressMap[item.id] || 0;
  if (completedSet.has(item.id) || prog === 100) return 'completed';
  const prevCompleted = items.slice(0, index).every((it) => {
    const p = progressMap[it.id] || 0;
    return completedSet.has(it.id) || p === 100;
  });
  return prevCompleted ? 'current' : 'locked';
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

export default function VerticalGameMap({
  items,
  progressMap,
  completedSet,
  onPressItem,
  onRequestUnlock,
  todaysReadingIds = new Set(),
}) {
  const dimensions = getResponsiveDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const popLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        Animated.timing(popAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    popLoop.start();
    return () => popLoop.stop();
  }, [popAnim]);

  const renderNode = ({ item, index }) => {
    const status = getStatus(item, index, items, progressMap, completedSet);
    const locked = status === 'locked';
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';
    const isTodaysReading = todaysReadingIds.has(item.id);
    const label = item.day ? `Day ${item.day}` : (item.title || item.name || `#${item.id}`);
    const previousItem = items[index - 1];
    const positionStyle = getNodePosition(index);
    const rotation = getNodeRotation(index);
    const extraMargin = index % 3 === 2 ? 20 : 8;

    const handlePress = () => {
      if (locked) {
        if (typeof onRequestUnlock === 'function') onRequestUnlock(item, index, previousItem);
        return;
      }
      if (typeof onPressItem === 'function') onPressItem(item, progressMap[item.id] || 0);
    };

    let nodeColor = COLORS.locked;
    let iconName = 'lock-closed';
    let iconColor = '#FFFFFF';
    if (isCompleted) {
      nodeColor = COLORS.semantic.success;
      iconName = 'checkmark';
    } else if (isTodaysReading || isCurrent) {
      nodeColor = COLORS.primary;
      iconName = 'book';
    }

    return (
      <View style={[styles.nodeWrapper, positionStyle, { marginVertical: extraMargin }]}>
        <TouchableOpacity activeOpacity={locked ? 0.9 : 0.7} onPress={handlePress} style={styles.nodeTouchable}>
          {(isCurrent || isTodaysReading) && (
            <Animated.View
              style={[
                styles.currentNodeRing,
                {
                  transform: [{ scale: popAnim }],
                  borderColor: nodeColor,
                  borderWidth: isTodaysReading ? 3 : 2,
                },
              ]}
            />
          )}
          <View style={[styles.nodeExternalShadow, { backgroundColor: nodeColor }]} />
          <Animated.View
            style={[
              styles.nodeCircle,
              {
                backgroundColor: nodeColor,
                transform: [
                  { rotate: rotation },
                  { scale: isCurrent || isTodaysReading ? pulseAnim : 1 },
                  { perspective: 1000 },
                  { rotateX: '15deg' },
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isTodaysReading ? 0.5 : 0.3,
                shadowRadius: isTodaysReading ? 16 : 12,
                elevation: isTodaysReading ? 20 : 15,
              },
            ]}
          >
            <View style={styles.nodeInnerShadow} />
            <Ionicons name={iconName} size={dimensions.iconSize.large} color={iconColor} style={{ zIndex: 2 }} />
          </Animated.View>
          <View style={styles.nodeLabelContainer}>
            <Text style={[styles.nodeLabel, { color: locked ? COLORS.text.tertiary : COLORS.text.light }]}>{label}</Text>
            <Text numberOfLines={2} style={[styles.nodeSubtitle, { color: locked ? COLORS.text.tertiary : 'rgba(247, 240, 227, 0.8)' }]}>
              {item.title || item.name || (item.theme ? item.theme : '')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.gameMapWrap}>
      <FlatList
        data={items}
        renderItem={renderNode}
        keyExtractor={(item, index) => item.id?.toString() || `index_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.journeyContainer}
        initialNumToRender={18}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  );
}
