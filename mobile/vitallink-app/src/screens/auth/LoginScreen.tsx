import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { RS, MONO } from '../../theme/RS';
import Drop from '../../components/Drop';
import { googleAuthConfig, isGoogleConfigured } from '../../googleConfig';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route?: { params?: { role?: 'donor' | 'patient' } };
};

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function LoginScreen({ navigation, route }: Props) {
  const role = route?.params?.role ?? 'patient';
  const isDonor = role === 'donor';
  const googleReady = isGoogleConfigured();

  const [group, setGroup] = useState('O+');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthConfig);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleLogin(id_token);
    } else if (response.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../../config');
      const body: Record<string, any> = { id_token: idToken, role };
      if (isDonor) body.blood_group = group;

      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Google sign-in failed');

      // Save common keys
      await AsyncStorage.setItem('access_token', data.token);
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('user_id', String(data.user_id));

      if (isDonor) {
        await Promise.all([
          AsyncStorage.setItem('donor_id', String(data.donor_id ?? data.user_id)),
          AsyncStorage.setItem('donor_name', data.name ?? ''),
          AsyncStorage.setItem('donor_email', data.email ?? ''),
          AsyncStorage.setItem('donor_group', group),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.setItem('patient_id', String(data.user_id)),
          AsyncStorage.setItem('patient_name', data.name ?? ''),
          AsyncStorage.setItem('patient_email', data.email ?? ''),
        ]);
      }
      navigation.replace(isDonor ? 'DonorHome' : 'PatientHome');
    } catch (e: any) {
      setError(e.message ?? 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Dev mode fallback
  const handleDevLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../../config');
      const devPhone = isDonor ? '9999999999' : '8888888888';
      const devName = isDonor ? `Dev Donor (${group})` : 'Dev Patient';

      const res = await fetch(`${BASE_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: devName,
          phone: devPhone,
          role,
          ...(isDonor ? { blood_group: group } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Dev login failed');

      await AsyncStorage.setItem('access_token', data.token);
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('user_id', String(data.user_id));

      if (isDonor) {
        await Promise.all([
          AsyncStorage.setItem('donor_id', String(data.donor_id ?? data.user_id)),
          AsyncStorage.setItem('donor_name', 'Dev Donor'),
          AsyncStorage.setItem('donor_group', group),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.setItem('patient_id', String(data.user_id)),
          AsyncStorage.setItem('patient_name', 'Dev Patient'),
        ]);
      }
      navigation.replace(isDonor ? 'DonorHome' : 'PatientHome');
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 4, padding: 4 }}>
            <Text style={{ fontSize: 20, color: RS.mid }}>←</Text>
          </TouchableOpacity>
          <Drop size={16} color={RS.accent} />
          <Text style={s.brand}>VitalLink</Text>
        </View>

        <View style={{ flex: 1, paddingTop: 20, gap: 18 }}>
          <View>
            <Text style={s.heading}>
              {isDonor ? 'Save a life.' : 'Quick access.'}
              {'\n'}Sign in with Google.
            </Text>
            <Text style={s.sub}>
              {isDonor
                ? 'You\'ll get instant alerts when someone near you needs your blood group.'
                : 'In an emergency there\'s no time for forms. Sign in and request blood in seconds.'}
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
                  {googleReady ? 'Sign in with Google' : `Continue as Dev ${isDonor ? 'Donor' : 'Patient'}`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Blood group picker — donor only */}
          {isDonor && (
            <>
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
            </>
          )}

          {/* Dev mode link — only shown when Google not configured */}
          {!googleReady && (
            <TouchableOpacity onPress={handleDevLogin} activeOpacity={0.7}>
              <Text style={s.devLink}>
                Continue as Dev {isDonor ? 'Donor' : 'Patient'} (no Google)
              </Text>
            </TouchableOpacity>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Text style={s.hint}>
            {googleReady
              ? 'You\'ll be asked to choose your Google account. Only your name and email are shared.'
              : 'Configure Google Client IDs in app.json to enable real Google Sign-In.'}
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
  heading: { fontSize: 28, fontWeight: '800', color: RS.ink, letterSpacing: -0.5, lineHeight: 34, marginBottom: 10 },
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: RS.line },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: RS.faint, textTransform: 'uppercase' },
  groupBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  groupText: { fontFamily: MONO, fontWeight: '700', fontSize: 14 },
  devLink: { fontSize: 12, color: RS.mid, textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },
  error: { fontSize: 12.5, color: RS.accent, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center', marginTop: 4 },
});
