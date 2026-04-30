import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BROWN = '#A07553';

const BADGE_COLORS = { S: '#4A90D9', O: '#7B68EE', A: '#E07B39', P: '#4A9B6F' };

export default function SoapJourneyCard({ note, onEdit, onDelete, onSaveApplication }) {
  const [expanded, setExpanded] = useState(false);

  const handleSaveApplication = () => {
    if (!note.soap_application?.trim()) return;
    Alert.alert(
      'Save to Application',
      `Track this action?\n\n"${note.soap_application.trim()}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: () => onSaveApplication(note.soap_application.trim()) },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded((v) => !v)} activeOpacity={0.85}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.meta}>
          <Ionicons name="map" size={13} color={BROWN} />
          <Text style={styles.date}>{note.date}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); onEdit(); }} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={16} color={BROWN} />
          </TouchableOpacity>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); onDelete(); }} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>{note.title}</Text>

      {/* Scripture always visible */}
      {note.soap_scripture ? (
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText} numberOfLines={expanded ? undefined : 2}>
            "{note.soap_scripture}"
          </Text>
        </View>
      ) : null}

      {/* Expanded SOAP */}
      {expanded && (
        <>
          {[
            { letter: 'O', label: 'Observation', value: note.soap_observation },
            { letter: 'A', label: 'Application', value: note.soap_application },
            { letter: 'P', label: 'Prayer', value: note.soap_prayer },
          ].map((s) =>
            s.value ? (
              <View key={s.letter} style={styles.soapRow}>
                <View style={[styles.badge, { backgroundColor: BADGE_COLORS[s.letter] }]}>
                  <Text style={styles.badgeLetter}>{s.letter}</Text>
                </View>
                <View style={styles.soapContent}>
                  <Text style={styles.soapLabel}>{s.label}</Text>
                  <Text style={styles.soapText}>{s.value}</Text>
                </View>
              </View>
            ) : null
          )}

          {note.soap_application?.trim() ? (
            <TouchableOpacity style={styles.saveAppBtn} onPress={handleSaveApplication}>
              <Ionicons name="checkmark-circle-outline" size={14} color={BROWN} />
              <Text style={styles.saveAppText}>Track this Application</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      {/* Expand toggle */}
      <View style={styles.expandRow}>
        <Text style={styles.expandLabel}>{expanded ? 'Show less' : 'Read full entry'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={BROWN} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderLeftWidth: 3, borderLeftColor: BROWN,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  date: { fontSize: 11, color: '#999' },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  scriptureBox: { backgroundColor: 'rgba(74,144,217,0.08)', borderRadius: 10, padding: 10, borderLeftWidth: 2, borderLeftColor: '#4A90D9', marginBottom: 8 },
  scriptureText: { fontStyle: 'italic', color: '#333', fontSize: 13, lineHeight: 20 },
  soapRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  badge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  badgeLetter: { color: '#fff', fontWeight: '800', fontSize: 12 },
  soapContent: { flex: 1 },
  soapLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  soapText: { fontSize: 13, color: '#333', lineHeight: 20 },
  saveAppBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, borderWidth: 1, borderColor: BROWN, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
  saveAppText: { fontSize: 12, color: BROWN, fontWeight: '600' },
  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  expandLabel: { fontSize: 12, color: BROWN, fontWeight: '600' },
});
