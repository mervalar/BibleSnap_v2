import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#8B5D33';

function Section({ title, items }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, i) => (
          <View key={item.label}>
            <TouchableOpacity style={styles.row} onPress={item.onPress} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, item.danger && styles.danger]}>{item.label}</Text>
                {item.sub ? <Text style={styles.rowSub}>{item.sub}</Text> : null}
              </View>
              {item.badge != null && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              {!item.danger && (
                <Ionicons name="chevron-forward" size={14} color="#C4B5A5" />
              )}
            </TouchableOpacity>
            {i < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileMenu({ journalCount, savedVersesCount, onJournal, onSavedVerses, onPlan, onLogout }) {
  const mySpace = [
    {
      icon: 'journal-outline',
      color: '#4A6741',
      bg: 'rgba(74,103,65,0.1)',
      label: 'My Journals',
      sub: `${journalCount} entr${journalCount === 1 ? 'y' : 'ies'}`,
      onPress: onJournal,
    },
    {
      icon: 'bookmark-outline',
      color: BROWN,
      bg: 'rgba(139,93,51,0.1)',
      label: 'Saved Verses',
      sub: `${savedVersesCount} verse${savedVersesCount === 1 ? '' : 's'}`,
      onPress: onSavedVerses,
    },
  ];

  const study = [
    {
      icon: 'map-outline',
      color: '#7B5EA7',
      bg: 'rgba(123,94,167,0.1)',
      label: 'My Reading Plan',
      sub: 'Change or view your plan',
      onPress: onPlan,
    },
    {
      icon: 'notifications-outline',
      color: '#E07B39',
      bg: 'rgba(224,123,57,0.1)',
      label: 'Reminders',
      sub: 'Daily study notifications',
      onPress: () => Alert.alert('Reminders', 'Manage your daily reminders from the Bible Study screen.'),
    },
  ];

  const appInfo = [
    {
      icon: 'information-circle-outline',
      color: '#2196F3',
      bg: 'rgba(33,150,243,0.1)',
      label: 'About BibleSnap',
      onPress: () =>
        Alert.alert(
          'About BibleSnap',
          'BibleSnap helps you study the Bible daily through structured lessons, journaling, and verse saving.\n\nVersion 1.0.3',
        ),
    },
    {
      icon: 'mail-outline',
      color: '#009688',
      bg: 'rgba(0,150,136,0.1)',
      label: 'Contact Us',
      sub: 'biblesnapofficial@gmail.com',
      onPress: () => Linking.openURL('mailto:biblesnapofficial@gmail.com'),
    },
    {
      icon: 'help-circle-outline',
      color: '#FF9800',
      bg: 'rgba(255,152,0,0.1)',
      label: 'FAQ',
      onPress: () =>
        Alert.alert(
          'FAQ',
          'Q: How do I track my reading?\nA: Complete lessons in BibleStudy — they count toward your weekly progress.\n\nQ: What is SOAP journaling?\nA: Scripture · Observation · Application · Prayer — a method to go deeper in your study.',
        ),
    },
  ];

  const account = [
    {
      icon: 'log-out-outline',
      color: '#F44336',
      bg: 'rgba(244,67,54,0.1)',
      label: 'Logout',
      danger: true,
      onPress: onLogout,
    },
  ];

  return (
    <View>
      <Section title="My Space" items={mySpace} />
      <Section title="Study" items={study} />
      <Section title="Learn More" items={appInfo} />
      <Section title="Account" items={account} />
      <Text style={styles.version}>BibleSnap v1.0.3 · Made with ♥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9B8870',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 249, 242, 0.96)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2417',
  },
  rowSub: {
    fontSize: 11,
    color: '#9B8870',
    marginTop: 1,
  },
  danger: { color: '#F44336' },
  badge: {
    backgroundColor: 'rgba(139,93,51,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: BROWN,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,93,51,0.08)',
    marginLeft: 60,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: '#B0A090',
    marginBottom: 16,
    marginTop: 4,
  },
});
