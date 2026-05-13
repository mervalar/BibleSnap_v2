import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#8B5D33';
const CARD_BG = 'rgba(255, 249, 242, 0.96)';

export default function ProfileCard({ user }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.avatarCircle}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <View style={styles.onlineDot} />
      <Text style={styles.name}>{user?.name || 'Friend'}</Text>
      <Text style={styles.email}>{user?.email || ''}</Text>
      {memberSince && (
        <View style={styles.memberBadge}>
          <Ionicons name="leaf-outline" size={10} color={BROWN} />
          <Text style={styles.memberText}>Growing since {memberSince}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,93,51,0.12)',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BROWN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: BROWN,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  onlineDot: {
    position: 'absolute',
    top: 56,
    right: '37%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  initial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2417',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  email: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 10,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139,93,51,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberText: {
    fontSize: 10,
    color: BROWN,
    fontWeight: '600',
  },
});
