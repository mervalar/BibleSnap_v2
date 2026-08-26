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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function AuthModal({ visible, onClose, navigation }) {
  const [step, setStep]           = useState('email');   // 'email' | 'otp'
  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const otpRefs               = useRef([]);

  const [, , promptGoogle] = Google.useIdTokenAuthRequest({
    androidClientId: GOOGLE_CLIENT_IDS.android,
    clientId:        GOOGLE_CLIENT_IDS.web,
  });

  // ── helpers ───────────────────────────────────────────────────
  const resetAndClose = () => {
    setStep('email');
    setEmail('');
    setEmailError('');
    setOtp(['', '', '', '', '', '']);
    setAgreedToTerms(false);
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a complete, valid email address.');
      return;
    }

    setEmailError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail.toLowerCase() }),
      });
      if (!res.ok && res.status >= 500) {
        setEmailError('The server is temporarily unavailable. Please try again later.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      } else {
        setEmailError(data.errors?.email?.[0] || data.message || 'Could not send code.');
      }
    } catch (e) {
      console.error('[sendOtp]', e?.message, e);
      setEmailError('Could not reach the server. Check your connection and try again.');
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
    const digits = val.replace(/\D/g, '');

    // Pasted (or autofilled) code: distribute across all boxes
    if (digits.length > 1) {
      const pasted = digits.slice(0, 6).split('');
      const updated = ['', '', '', '', '', ''];
      pasted.forEach((d, i) => { updated[i] = d; });
      setOtp(updated);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    const updated = [...otp];
    updated[idx] = digits;
    setOtp(updated);
    if (digits && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color="#AAA" />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Ionicons name="book" size={20} color={BROWN} />
            <Text style={styles.appName}>BiblePause</Text>
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.title}>Sign in</Text>

              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="your@email.com"
                placeholderTextColor="#C4B5A5"
                value={email}
                onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSendOtp}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedToTerms(!agreedToTerms)} activeOpacity={0.7}>
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the{' '}
                  <Text style={styles.checkboxLink}>Terms of Service</Text>
                  {' & '}
                  <Text style={styles.checkboxLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, (!email.trim() || loading || !agreedToTerms) && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={!email.trim() || loading || !agreedToTerms}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="mail-outline" size={15} color="#fff" />
                    <Text style={styles.primaryBtnText}>Continue with Email</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.googleBtn, (!agreedToTerms || loading) && styles.btnDisabled]}
                onPress={handleGoogleSignIn}
                disabled={loading || !agreedToTerms}
                activeOpacity={0.85}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setStep('email')} style={styles.backRow}>
                <Ionicons name="arrow-back" size={14} color={BROWN} />
                <Text style={styles.backText}>Change email</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>Code sent to <Text style={styles.emailHighlight}>{email}</Text></Text>

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
                    maxLength={6}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (otp.join('').length < 6 || loading) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.join('').length < 6 || loading}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
                    <Text style={styles.primaryBtnText}>Verify code</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSendOtp} disabled={loading} style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink}>Resend</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#FDFBF9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#E0D4CC', borderRadius: 2,
    alignSelf: 'center', marginBottom: 14,
  },
  closeBtn: { position: 'absolute', top: 14, right: 14, padding: 6, zIndex: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  appName: { fontSize: 16, fontWeight: '800', color: BROWN, letterSpacing: 0.3 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  subtitle: { fontSize: 12, color: '#A09080', lineHeight: 18, marginBottom: 14 },
  emailHighlight: { fontWeight: '700', color: '#1A1A1A' },
  input: {
    backgroundColor: '#F5EFE8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(139,93,51,0.15)', marginBottom: 12,
  },
  inputError: { borderColor: '#F44336' },
  errorText: { color: '#F44336', fontSize: 12, fontWeight: '600', marginTop: -6, marginBottom: 10 },
  primaryBtn: {
    backgroundColor: BROWN, borderRadius: 12, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, marginBottom: 12,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(139,93,51,0.12)' },
  dividerText: { color: '#C4B5A5', fontSize: 11 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(139,93,51,0.2)', borderRadius: 12, paddingVertical: 11,
  },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  backText: { fontSize: 12, color: BROWN, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 18 },
  otpBox: {
    width: 44, height: 52, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139,93,51,0.2)',
    textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#1A1A1A', backgroundColor: '#F5EFE8',
  },
  otpBoxFilled: { borderColor: BROWN, backgroundColor: 'rgba(160,117,83,0.08)' },
  resendRow: { alignItems: 'center', paddingVertical: 8 },
  resendText: { fontSize: 12, color: '#A09080' },
  resendLink: { color: BROWN, fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
    borderColor: 'rgba(139,93,51,0.3)', backgroundColor: '#F5EFE8',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: BROWN, borderColor: BROWN },
  checkboxText: { fontSize: 11, color: '#A09080', flex: 1, lineHeight: 17 },
  checkboxLink: { color: BROWN, fontWeight: '600' },
});
