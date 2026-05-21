import { useState, useRef } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';


WebBrowser.maybeCompleteAuthSession();

const API = 'https://biblesnap.bellatis.com/api';

const GOOGLE_CLIENT_IDS = {
  android: '689137632827-q0rr0i7jb5bdj18edmge8qcoqfugs43k.apps.googleusercontent.com',
  web:     '689137632827-40a21olclonedpim1c1lf7h7041okaum.apps.googleusercontent.com',
};

const BROWN = '#A07553';
const BG    = '#FAF7F4';

async function storeSession(user, token) {
  const data = { ...user, token };
  await AsyncStorage.setItem('user', JSON.stringify(data));
  await AsyncStorage.setItem('isAuthenticated', 'true');
  if (token) await AsyncStorage.setItem('token', token);
}

export default function AuthModal({ visible, onClose, navigation }) {
  const [step, setStep]       = useState('email');   // 'email' | 'otp'
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs               = useRef([]);

  const [, , promptGoogle] = Google.useIdTokenAuthRequest({
    androidClientId: GOOGLE_CLIENT_IDS.android,
    clientId:        GOOGLE_CLIENT_IDS.web,
  });

  // ── helpers ───────────────────────────────────────────────────
  const resetAndClose = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  const handleAuthSuccess = async (user, token, isNew) => {
    await storeSession(user, token);
    if (isNew) {
      await AsyncStorage.setItem('pendingOnboarding', 'true').catch(() => {});
    }
    resetAndClose();
    navigation?.navigate('Home');
  };

  // ── Step 1: send OTP ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok && res.status >= 500) {
        Alert.alert('Server error', 'The server is temporarily unavailable. Please try again later.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      } else {
        Alert.alert('Error', data.message || 'Could not send code.');
      }
    } catch (e) {
      console.error('[sendOtp]', e?.message, e);
      Alert.alert('Error', 'Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = await res.json();
      if (data.success) {
        await handleAuthSuccess(data.user, data.token, data.is_new);
      } else {
        Alert.alert('Invalid code', data.message || 'Please check the code and try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await promptGoogle();
      if (result?.type !== 'success') { setLoading(false); return; }

      const { id_token } = result.params;
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token }),
      });
      const data = await res.json();
      if (data.success) {
        await handleAuthSuccess(data.user, data.token, data.is_new);
      } else {
        Alert.alert('Google sign-in failed', data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    const updated = [...otp];
    updated[idx] = val.slice(-1);
    setOtp(updated);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          {/* Close */}
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#888" />
          </TouchableOpacity>

          {/* Logo / title */}
          <View style={styles.logoRow}>
            <Ionicons name="book" size={28} color={BROWN} />
            <Text style={styles.appName}>BibleSnap</Text>
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>Enter your email to continue. We'll send you a code.</Text>

              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={handleSendOtp}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, (!email.trim() || loading) && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={!email.trim() || loading}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="mail-outline" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}>Continue with Email</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading} activeOpacity={0.85}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <Text style={styles.legalText}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setStep('email')} style={styles.backRow}>
                <Ionicons name="arrow-back" size={16} color={BROWN} />
                <Text style={styles.backText}>Change email</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to{'\n'}<Text style={styles.emailHighlight}>{email}</Text></Text>

              {/* 6-digit code boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(r) => { otpRefs.current[idx] = r; }}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (otp.join('').length < 6 || loading) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.join('').length < 6 || loading}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}>Verify code</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSendOtp} disabled={loading} style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink}>Resend code</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  appName: { fontSize: 20, fontWeight: '800', color: BROWN },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 24 },
  emailHighlight: { fontWeight: '700', color: '#1A1A1A' },
  input: {
    backgroundColor: BG, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#EEE', marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: BROWN, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 16,
  },
  btnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { color: '#bbb', fontSize: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 14, paddingVertical: 14, marginBottom: 20,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  legalText: { fontSize: 11, color: '#bbb', textAlign: 'center', lineHeight: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, color: BROWN, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 24 },
  otpBox: {
    width: 46, height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: '#DDD',
    textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#1A1A1A', backgroundColor: BG,
  },
  otpBoxFilled: { borderColor: BROWN, backgroundColor: 'rgba(160,117,83,0.08)' },
  resendRow: { alignItems: 'center', paddingVertical: 8 },
  resendText: { fontSize: 13, color: '#888' },
  resendLink: { color: BROWN, fontWeight: '700' },
});
