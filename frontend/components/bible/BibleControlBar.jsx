import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGE_OPTIONS } from '../../constants/bibleApi';

const BROWN = '#A07553';

export default function BibleControlBar({ onSavedVerses, language, onLanguageChange, onFontSize, onSearch, isSearchActive }) {
  const [showLang, setShowLang] = useState(false);

  return (
    <View style={styles.bar}>
      {onSearch != null && (
        <>
          <TouchableOpacity style={[styles.btn, isSearchActive && styles.btnActive]} onPress={onSearch}>
            <Ionicons name="search-outline" size={16} color={isSearchActive ? '#fff' : BROWN} />
          </TouchableOpacity>
          <View style={styles.sep} />
        </>
      )}
      <TouchableOpacity style={styles.btn} onPress={onSavedVerses}>
        <Ionicons name="bookmark-outline" size={16} color={BROWN} />
      </TouchableOpacity>
      <View style={styles.sep} />
      <TouchableOpacity style={styles.btn} onPress={() => setShowLang(true)}>
        <Ionicons name="globe-outline" size={16} color={BROWN} />
      </TouchableOpacity>
      {onFontSize != null && (
        <>
          <View style={styles.sep} />
          <TouchableOpacity style={styles.btn} onPress={onFontSize}>
            <Ionicons name="text-outline" size={16} color={BROWN} />
          </TouchableOpacity>
        </>
      )}

      <Modal transparent visible={showLang} animationType="fade" onRequestClose={() => setShowLang(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowLang(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Language</Text>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, language === opt.value && styles.optionActive]}
                onPress={() => { onLanguageChange(opt.value); setShowLang(false); }}
              >
                <Text style={[styles.optionText, language === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                {language === opt.value && <Ionicons name="checkmark" size={16} color={BROWN} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160,117,83,0.08)',
    borderRadius: 20,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  btn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  btnActive: {
    backgroundColor: BROWN,
  },
  sep: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(160,117,83,0.25)',
    marginHorizontal: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FDFBF9',
    borderRadius: 16,
    paddingVertical: 6,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9B8870',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  optionActive: { backgroundColor: 'rgba(160,117,83,0.08)' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextActive: { fontWeight: '600', color: BROWN },
});
