import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS } from '../../theme/RS';
import Drop from '../../components/Drop';
import api from '../../api/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const DEMO_PHONE = {
  donor: '9999999991',
  patient: '9999999992',
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState<'donor' | 'patient' | null>(null);
  const [error, setError] = useState('');

  const demoLogin = async (role: 'donor' | 'patient') => {
    setLoading(role);
    setError('');
    try {
      const res = await api.post('/auth/demo', {
        name: role === 'donor' ? 'Demo Donor' : 'Demo Patient',
        phone: DEMO_PHONE[role],
        role,
        blood_group: role === 'donor' ? 'O+' : undefined,
      });

      const data = res.data;

      // Store tokens from real backend response
      await AsyncStorage.setItem('access_token', data.token);
      await AsyncStorage.setItem('user_role', data.role);
      await AsyncStorage.setItem('user_id', String(data.user_id));

      if (data.role === 'donor') {
        await Promise.all([
          AsyncStorage.setItem('donor_id', String(data.donor_id)),
          AsyncStorage.setItem('donor_name', data.name || 'Demo Donor'),
          AsyncStorage.setItem('donor_group', data.blood_group || 'O+'),
          AsyncStorage.setItem('donor_email', 'donor@vitallink.app'),
        ]);
        navigation.replace('DonorHome');
      } else {
        await Promise.all([
          AsyncStorage.setItem('patient_id', String(data.user_id)),
          AsyncStorage.setItem('patient_name', data.name || 'Demo Patient'),
          AsyncStorage.setItem('patient_email', 'patient@vitallink.app'),
        ]);
        navigation.replace('PatientHome');
      }
    } catch (e: any) {
      const errMsg = e?.response?.data?.detail || e?.message || 'Connection error';
      setError(errMsg);

      // Fallback: offline demo mode (still works without backend)
      await AsyncStorage.setItem('access_token', 'demo-token');
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('user_id', '1');

      if (role === 'donor') {
        await Promise.all([
          AsyncStorage.setItem('donor_id', '1'),
          AsyncStorage.setItem('donor_name', 'Demo Donor'),
          AsyncStorage.setItem('donor_group', 'O+'),
          AsyncStorage.setItem('donor_email', 'donor@vitallink.app'),
        ]);
        navigation.replace('DonorHome');
      } else {
        await Promise.all([
          AsyncStorage.setItem('patient_id', '1'),
          AsyncStorage.setItem('patient_name', 'Demo Patient'),
          AsyncStorage.setItem('patient_email', 'patient@vitallink.app'),
        ]);
        navigation.replace('PatientHome');
      }
    } finally {
      setLoading(null);
    }
  };

  const isDonorLoading = loading === 'donor';
  const isPatientLoading = loading === 'patient';

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <Drop size={40} color={RS.accent} />
        <Text style={s.brand}>VitalLink</Text>
        <Text style={s.tagline}>Emergency Blood Matching Platform</Text>
      </View>

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <Text style={s.errorSub}>Falling back to offline demo mode</Text>
        </View>
      ) : null}

      <View style={s.buttonSection}>
        <Text style={s.heading}>Welcome to VitalLink</Text>
        <Text style={s.sub}>Choose a role to enter the demo</Text>

        <TouchableOpacity
          onPress={() => demoLogin('donor')}
          disabled={loading !== null}
          activeOpacity={0.85}
          style={s.donorBtn}
        >
          {isDonorLoading ? (
            <ActivityIndicator color={RS.accent} />
          ) : (
            <>
              <Text style={s.btnIcon}>🩸</Text>
              <Text style={s.btnLabel}>Login as Donor</Text>
              <Text style={s.btnDesc}>Receive alerts, donate blood, save lives</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => demoLogin('patient')}
          disabled={loading !== null}
          activeOpacity={0.85}
          style={s.patientBtn}
        >
          {isPatientLoading ? (
            <ActivityIndicator color={RS.teal} />
          ) : (
            <>
              <Text style={s.btnIcon}>🏥</Text>
              <Text style={s.btnLabel}>Login as Patient</Text>
              <Text style={s.btnDesc}>Request blood, find donors, get help</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>Demo mode - connects to backend for full experience</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', padding: 28 },
  topSection: { alignItems: 'center', marginBottom: 50 },
  brand: { fontSize: 32, fontWeight: '800', color: '#1A1A2E', marginTop: 12, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#888', marginTop: 4 },
  buttonSection: { gap: 16 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 8 },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#E63946',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 12, fontWeight: '600', color: '#E63946', textAlign: 'center' },
  errorSub: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4 },
  donorBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E63946',
    alignItems: 'center',
    gap: 4,
  },
  patientBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#457B9D',
    alignItems: 'center',
    gap: 4,
  },
  btnIcon: { fontSize: 32 },
  btnLabel: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  btnDesc: { fontSize: 12, color: '#888' },
  footer: { textAlign: 'center', color: '#AAA', fontSize: 12, marginTop: 20 },
});
