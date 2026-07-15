import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS } from '../../theme/RS';
import Drop from '../../components/Drop';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const demoLogin = async (role: 'donor' | 'patient') => {
    const isDonor = role === 'donor';
    await AsyncStorage.setItem('access_token', 'demo-token');
    await AsyncStorage.setItem('user_role', role);
    await AsyncStorage.setItem('user_id', '1');

    if (isDonor) {
      await Promise.all([
        AsyncStorage.setItem('donor_id', '1'),
        AsyncStorage.setItem('donor_name', 'Demo Donor'),
        AsyncStorage.setItem('donor_group', 'O+'),
        AsyncStorage.setItem('donor_email', 'donor@vitallink.app'),
      ]);
    } else {
      await Promise.all([
        AsyncStorage.setItem('patient_id', '1'),
        AsyncStorage.setItem('patient_name', 'Demo Patient'),
        AsyncStorage.setItem('patient_email', 'patient@vitallink.app'),
      ]);
    }
    navigation.replace(isDonor ? 'DonorHome' : 'PatientHome');
  };

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <Drop size={40} color={RS.accent} />
        <Text style={s.brand}>VitalLink</Text>
        <Text style={s.tagline}>Emergency Blood Matching Platform</Text>
      </View>

      <View style={s.buttonSection}>
        <Text style={s.heading}>Welcome to VitalLink</Text>
        <Text style={s.sub}>Choose a role to enter the demo</Text>

        <TouchableOpacity
          onPress={() => demoLogin('donor')}
          activeOpacity={0.85}
          style={s.donorBtn}
        >
          <Text style={s.btnIcon}>🩸</Text>
          <Text style={s.btnLabel}>Login as Donor</Text>
          <Text style={s.btnDesc}>Receive alerts, donate blood, save lives</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => demoLogin('patient')}
          activeOpacity={0.85}
          style={s.patientBtn}
        >
          <Text style={s.btnIcon}>🏥</Text>
          <Text style={s.btnLabel}>Login as Patient</Text>
          <Text style={s.btnDesc}>Request blood, find donors, get help</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>Demo mode — no login required</Text>
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
  footer: { textAlign: 'center', color: '#AAA', fontSize: 12, marginTop: 40 },
});
