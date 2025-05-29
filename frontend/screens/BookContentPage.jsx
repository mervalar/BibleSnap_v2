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

      {/* Audio Player Section */}
      <View style={styles.audioSection}>
        <View style={styles.audioPlayer}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle}>John Chapter 3</Text>
            <Text style={styles.audioTime}>12:30 / 25:45</Text>
          </View>
          <View style={styles.audioControls}>
            <TouchableOpacity>
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Audio Control Icons */}
        <View style={styles.rightControls}>
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
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
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
  audioSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AE796D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A07553',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playIcon: {
    color: 'white',
    fontSize: 16,
    marginLeft: 2,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  audioTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlIcon: {
    color: 'white',
    fontSize: 18,
  },
  rightControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
});

export default BookContent;