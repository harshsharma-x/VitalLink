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

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function LoginScreen({ navigation }: Props) {
  const googleReady = isGoogleConfigured();

  const [group, setGroup] = useState('O+');
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
          role: 'donor',
          blood_group: group,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Google sign-in failed');

      await Promise.all([
        AsyncStorage.setItem('access_token', data.token),
        AsyncStorage.setItem('donor_id', String(data.donor_id ?? data.user_id)),
        AsyncStorage.setItem('donor_name', data.name ?? ''),
        AsyncStorage.setItem('donor_email', data.email ?? ''),
        AsyncStorage.setItem('donor_group', group),
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
          name: `Dev Donor (${group})`,
          phone: '9999999999',
          role: 'donor',
          blood_group: group,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Dev login failed');

      await Promise.all([
        AsyncStorage.setItem('access_token', data.token),
        AsyncStorage.setItem('donor_id', String(data.donor_id ?? data.user_id)),
        AsyncStorage.setItem('donor_name', `Dev Donor`),
        AsyncStorage.setItem('donor_group', group),
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
            <Text style={s.heading}>Sign in{'\n'}with Google.</Text>
            <Text style={s.sub}>
              Use your Google account to get started. We'll use your name and email from your profile.
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
                  {googleReady ? 'Sign in with Google' : 'Continue as Donor (Dev)'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Blood group picker */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>select your blood group</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GROUPS.map(g => (
              <TouchableOpacity
                key={g}
                onPress={() => setGroup(g)}
                style={[s.groupBtn, {
                  borderColor: g === group ? RS.accent : RS.line,
                  backgroundColor: g === group ? RS.soft : RS.white,
                  width: '23%',
               }]}
              >
                <Text style={[s.groupText, { color: g === group ? RS.accent : RS.mid }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Text style={s.hint}>
            {googleReady
              ? 'You\'ll be asked to choose your Google account. Only your name and email are shared.'
              : 'DEV MODE — Configure Google Client ID in app.json to enable real Google Sign-In.'}
          </Text>
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
    borderRadius: 12, paddingVertical: 15, gap: 10,
  },
  googleIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0F6FF', alignItems: 'center', justifyContent: 'center',
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#444' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: RS.line },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: RS.faint, textTransform: 'uppercase' },
  groupBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  groupText: { fontFamily: MONO, fontWeight: '700', fontSize: 14 },
  error: { fontSize: 12.5, color: RS.accent, fontWeight: '600' },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center', marginTop: 4 },
});
