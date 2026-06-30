import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import RSAppHeader from '../components/RSAppHeader';
import RSCard from '../components/RSCard';
import RSLabel from '../components/RSLabel';

type Props = { navigation: NativeStackNavigationProp<any> };

function SettingRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 13.5, fontWeight: '600', color: RS.ink }}>{label}</Text>
        <Text style={{ fontSize: 11.5, color: RS.mid, lineHeight: 16 }}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: RS.line, true: RS.teal }} thumbColor={RS.white} />
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('User');
  const [phone, setPhone] = useState('');
  const [abdm, setAbdm] = useState(true);
  const [disha, setDisha] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [anonymize, setAnonymize] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('patient_name'),
      AsyncStorage.getItem('patient_phone'),
    ]).then(([n, p]) => {
      if (n) setName(n);
      if (p) setPhone(p);
    });
  }, []);

  const maskedPhone = phone.length === 10 ? `+91 ${phone.slice(0, 2)}****${phone.slice(6)}` : '+91 ••••••••••';

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'patient_id', 'patient_name', 'patient_phone', 'cached_requests']);
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Profile" sub="Privacy &amp; health data" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16 }}>
        <RSCard style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: RS.ink }}>{name}</Text>
            <Text style={{ fontFamily: MONO, fontSize: 12, color: RS.mid, marginTop: 3 }}>{maskedPhone}</Text>
            <View style={[s.badge, { backgroundColor: RS.steal, marginTop: 5 }]}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: RS.teal }}>Patient Account</Text>
            </View>
          </View>
        </RSCard>

        <View>
          <RSLabel>ABDM consent</RSLabel>
          <RSCard style={{ gap: 0 }}>
            <SettingRow
              label="Share health records via ABHA"
              sub="Doctors can pull your blood type and Hb from ABDM during an emergency."
              value={abdm}
              onChange={setAbdm}
            />
            <View style={s.divider} />
            <SettingRow
              label="DISHA data rights"
              sub="You can request a full export or deletion of your data under the Digital Information Security in Healthcare Act."
              value={disha}
              onChange={setDisha}
            />
          </RSCard>
        </View>

        <View>
          <RSLabel>Privacy</RSLabel>
          <RSCard style={{ gap: 0 }}>
            <SettingRow
              label="Share approximate location"
              sub="Only shared during an active request. Precise coordinates are never logged."
              value={shareLocation}
              onChange={setShareLocation}
            />
            <View style={s.divider} />
            <SettingRow
              label="Mask my identity from donors"
              sub="Donors see the hospital, not your name or number. A proxy call is used."
              value={anonymize}
              onChange={setAnonymize}
            />
          </RSCard>
        </View>

        <RSCard style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: RS.mid, lineHeight: 18 }}>
            Your data is stored on Indian servers under IT Act 2000. VitalLink does not sell or share your health data with third parties.
          </Text>
          <View style={s.badge}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: RS.amber }}>DISHA compliant · NHA partner</Text>
          </View>
        </RSCard>

        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: RS.accent }}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: RS.soft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: RS.accent },
  badge: { backgroundColor: RS.samber, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { height: 1, backgroundColor: RS.line },
  logoutBtn: { borderWidth: 1.5, borderColor: RS.softLine ?? RS.line, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
});
