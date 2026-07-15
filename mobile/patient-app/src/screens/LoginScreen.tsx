import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { RS, MONO } from '../theme/RS';
import Drop from '../components/Drop';
import { googleAuthConfig, isGoogleConfigured } from '../googleConfig';

WebBrowser.maybeCompleteAuthSession();

type Props = { navigation: NativeStackNavigationProp<any> };

export default function LoginScreen({ navigation }: Props) {
  const googleReady = isGoogleConfigured();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Auth Request — reads client IDs from app.json via googleConfig
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthConfig);

  // Handle Google OAuth response
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleLogin(id_token);
    } else if (response.type === 'error') {
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../config');
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: idToken,
          role: 'patient',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Google sign-in failed');

      await Promise.all([
        AsyncStorage.setItem('access_token', data.token),
        AsyncStorage.setItem('patient_id', String(data.user_id)),
        AsyncStorage.setItem('patient_name', data.name ?? ''),
        AsyncStorage.setItem('patient_email', data.email ?? ''),
      ]);
      navigation.replace('Home');
    } catch (e: any) {
      setError(e.message ?? 'Could not connect to server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Dev mode: simulate Google login without actual credentials ────────────
  const handleDevLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../config');
      const res = await fetch(`${BASE_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Dev Patient',
          phone: '8888888888',
          role: 'patient',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Dev login failed');

      await Promise.all([
        AsyncStorage.setItem('access_token', data.token),
        AsyncStorage.setItem('patient_id', String(data.user_id)),
        AsyncStorage.setItem('patient_name', 'Dev Patient'),
      ]);
      navigation.replace('Home');
    } catch (e: any) {
      setError(e.message ?? 'Dev login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: RS.fog }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Drop size={16} color={RS.accent} />
          <Text style={s.brand}>VitalLink</Text>
        </View>

        <View style={{ flex: 1, paddingTop: 26, gap: 18 }}>
          <View>
            <Text style={s.heading}>Quick access.{'\n'}Google login.</Text>
            <Text style={s.sub}>
              In an emergency there's no time for forms. Sign in with Google and you're ready to request blood in seconds.
            </Text>
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            onPress={() => {
              if (googleReady) promptAsync();
              else handleDevLogin();
            }}
            disabled={loading}
            activeOpacity={0.82}
            style={s.googleBtn}
          >
            {loading ? (
              <ActivityIndicator color="#555" />
            ) : (
              <>
                <View style={s.googleIcon}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
                </View>
                <Text style={s.googleBtnText}>
                  {googleReady ? 'Sign in with Google' : 'Continue as Dev Patient'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Dev link — only when Google not configured */}
          {!googleReady && (
            <TouchableOpacity onPress={handleDevLogin} activeOpacity={0.7}>
              <Text style={s.devLink}>
                (or tap to use demo mode)
              </Text>
            </TouchableOpacity>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Text style={s.hint}>
            {googleReady
              ? 'You\'ll be asked to choose your Google account. Only your name and email are shared.'
              : 'DEV MODE — Configure Google Client ID in app.json to enable real Google Sign-In.'}
          </Text>

          <View style={s.infoCard}>
            <Text style={s.infoTitle}>🚨 For emergencies</Text>
            <Text style={s.infoText}>
              Your identity helps hospitals verify your request faster. No form-filling needed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brand: { fontSize: 15, fontWeight: '800', color: RS.ink, letterSpacing: -0.2 },
  heading: { fontSize: 30, fontWeight: '800', color: RS.ink, letterSpacing: -0.5, lineHeight: 36, marginBottom: 10 },
  sub: { fontSize: 13, color: RS.mid, lineHeight: 20 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line,
    borderRadius: 12, paddingVertical: 15, gap: 10, marginTop: 8,
  },
  googleIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0F6FF', alignItems: 'center', justifyContent: 'center',
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#444' },
  devLink: { fontSize: 12, color: RS.mid, textAlign: 'center', textDecorationLine: 'underline', marginTop: -4 },
  error: { fontSize: 12.5, color: RS.accent, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center', marginTop: 4 },
  infoCard: {
    backgroundColor: RS.steal, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: RS.teal,
    marginTop: 16,
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: RS.teal, marginBottom: 4 },
  infoText: { fontSize: 11.5, color: '#0a5a47', lineHeight: 17 },
});
