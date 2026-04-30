import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'journey', label: 'Journey', icon: 'map-outline', activeIcon: 'map' },
  { key: 'application', label: 'Application', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle' },
  { key: 'wishlist', label: 'Wishlist', icon: 'heart-outline', activeIcon: 'heart' },
];

const BROWN = '#A07553';

export default function JournalFilterTabs({ activeSection, onSelect }) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const active = activeSection === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={active ? tab.activeIcon : tab.icon} size={16} color={active ? '#fff' : BROWN} />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BROWN,
  },
  tabActive: { backgroundColor: BROWN },
  label: { fontSize: 12, fontWeight: '700', color: BROWN },
  labelActive: { color: '#fff' },
});
