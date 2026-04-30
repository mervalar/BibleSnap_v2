import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#8B5D33';

export default function ProfileCard({ user }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.band} />
      <View style={styles.avatarWrap}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.name}>{user?.name || 'Friend'}</Text>
      <Text style={styles.email}>{user?.email || ''}</Text>
      {memberSince && (
        <View style={styles.memberBadge}>
          <Ionicons name="leaf-outline" size={12} color={BROWN} />
          <Text style={styles.memberText}>Growing since {memberSince}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  band: {
    width: '100%',
    height: 80,
    backgroundColor: BROWN,
  },
  avatarWrap: {
    marginTop: -48,
    marginBottom: 12,
    position: 'relative',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BROWN,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139,93,51,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    color: BROWN,
    fontWeight: '600',
  },
});
