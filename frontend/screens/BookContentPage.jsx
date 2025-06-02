import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const BookContent = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>John 3</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.icon}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.icon}>🔖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.icon}>📝</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.verse}>
          <Text style={styles.verseNumber}>1</Text>
          <Text style={styles.verseText}>
            Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.
          </Text>
        </View>

        <View style={styles.verse}>
          <Text style={styles.verseNumber}>2</Text>
          <Text style={styles.verseText}>
            He came to Jesus at night and said, "Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him."
          </Text>
        </View>

        <View style={styles.verse}>
          <Text style={styles.verseNumber}>3</Text>
          <Text style={styles.verseText}>
            Jesus replied, "Very truly I tell you, no one can see the kingdom of God unless they are born again."
          </Text>
        </View>

        <View style={styles.verse}>
          <Text style={styles.verseNumber}>4</Text>
          <Text style={styles.verseText}>
            "How can someone be born when they are old?" Nicodemus asked. "Surely they cannot enter a second time into their mother's womb to be born!"
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Audio Player */}
      <View style={styles.audioPlayerContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>1:20</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
              <View style={styles.progressThumb} />
            </View>
          </View>
          <Text style={styles.timeText}>3:50</Text>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Audio Info */}
        <Text style={styles.audioTitle}>John Chapter 3</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 20,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#333',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AE796D',
    marginRight: 8,
    marginTop: 2,
    minWidth: 16,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  audioPlayerContainer: {
    backgroundColor: '#9E795D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    minWidth: 28,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '35%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  progressThumb: {
    position: 'absolute',
    left: '33%',
    top: -3,
    width: 9,
    height: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 4.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    gap: 24,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playIcon: {
    color: '#9E795D',
    fontSize: 18,
    marginLeft: 2,
  },
  audioTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default BookContent;