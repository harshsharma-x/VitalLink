import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import Drop from '../components/Drop';
import RSBtn from '../components/RSBtn';

type Props = { navigation: NativeStackNavigationProp<any> };

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function LoginScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('O+');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim().length > 0 && /^[6-9]\d{9}$/.test(phone);

  const handleLogin = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return; }
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../config');
      const res = await fetch(`${BASE_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone, role: 'donor', blood_group: group }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      await AsyncStorage.multiSet([
        ['access_token', data.token],
        ['donor_id', String(data.donor_id ?? data.user_id)],
        ['donor_name', name.trim()],
        ['donor_group', group],
        ['donor_phone', phone],
      ]);
      navigation.replace('Home');
    } catch {
      setError('Could not reach server. Check your Wi-Fi and try again.');
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
        <View style={s.progress}>
          {[0, 1].map(i => (<View key={i} style={[s.dot, { backgroundColor: i === 0 ? RS.accent : RS.line }]} />))}
        </View>
        <View style={{ flex: 1, paddingTop: 26, gap: 18 }}>
          <View>
            <Text style={s.heading}>Save a life{'\n'}in 90 seconds.</Text>
            <Text style={s.sub}>Register as a donor — you'll get instant alerts when someone near you needs your blood group.</Text>
          </View>
          <View style={{ gap: 14 }}>
            <View>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput style={s.input} placeholder="Your name" placeholderTextColor={RS.faint}
                value={name} onChangeText={t => { setName(t); setError(''); }} autoCapitalize="words" returnKeyType="next" />
            </View>
            <View>
              <Text style={s.label}>MOBILE NUMBER</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={s.cc}><Text style={s.ccText}>+91</Text></View>
                <TextInput style={[s.input, { flex: 1 }]} placeholder="10-digit number" placeholderTextColor={RS.faint}
                  value={phone} onChangeText={t => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  keyboardType="phone-pad" maxLength={10} returnKeyType="done" onSubmitEditing={handleLogin} />
              </View>
            </View>
            <View>
              <Text style={s.label}>MY BLOOD GROUP</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GROUPS.map(g => (
                  <TouchableOpacity key={g} onPress={() => setGroup(g)}
                    style={[s.groupBtn, { borderColor: g === group ? RS.accent : RS.line, backgroundColor: g === group ? RS.soft : RS.white, width: '23%' }]}>
                    <Text style={[s.groupText, { color: g === group ? RS.accent : RS.mid }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          {error ? <Text style={{ fontSize: 12.5, color: RS.accent, fontWeight: '600' }}>{error}</Text> : null}
          <RSBtn onPress={handleLogin} accent={RS.accent} big loading={loading} disabled={!isValid} style={{ marginTop: 8 }}>
            Register as donor
          </RSBtn>
          <Text style={s.hint}>You'll receive alerts only when you're available. You can switch off anytime.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brand: { fontSize: 15, fontWeight: '800', color: RS.ink, letterSpacing: -0.2 },
  progress: { flexDirection: 'row', gap: 5, marginTop: 14 },
  dot: { height: 4, borderRadius: 2, flex: 1 },
  heading: { fontSize: 30, fontWeight: '800', color: RS.ink, letterSpacing: -0.5, lineHeight: 36, marginBottom: 10 },
  sub: { fontSize: 13, color: RS.mid, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: RS.faint, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: RS.ink },
  cc: { backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 13 },
  ccText: { fontFamily: MONO, fontWeight: '600', fontSize: 15, color: RS.ink },
  groupBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  groupText: { fontFamily: MONO, fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center', marginTop: 4 },
});
