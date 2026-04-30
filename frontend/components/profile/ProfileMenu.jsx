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
                <Ionicons name="chevron-forward" size={14} color="#CCC" />
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
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  rowSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  danger: { color: '#F44336' },
  badge: {
    backgroundColor: 'rgba(139,93,51,0.12)',
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
    backgroundColor: '#F5F5F5',
    marginLeft: 68,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    marginBottom: 16,
    marginTop: 4,
  },
});
