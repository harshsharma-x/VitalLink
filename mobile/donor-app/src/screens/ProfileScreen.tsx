import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import RSAppHeader from '../components/RSAppHeader';
import RSCard from '../components/RSCard';
import RSLabel from '../components/RSLabel';
import BloodTag from '../components/BloodTag';

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
  const [name, setName] = useState('Donor');
  const [group, setGroup] = useState('O+');
  const [phone, setPhone] = useState('');
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertRadius, setAlertRadius] = useState(true);
  const [shareAbha, setShareAbha] = useState(true);
  const [anonymize, setAnonymize] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('donor_name'),
      AsyncStorage.getItem('donor_group'),
      AsyncStorage.getItem('donor_phone'),
    ]).then(([n, g, p]) => {
      if (n) setName(n);
      if (g) setGroup(g);
      if (p) setPhone(p);
    });
  }, []);

  const maskedPhone = phone.length === 10 ? `+91 ${phone.slice(0, 2)}****${phone.slice(6)}` : '+91 ••••••••••';

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'donor_id', 'donor_name', 'donor_group', 'donor_phone', 'cached_profile', 'cached_donations']);
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Profile" sub="ABHA &amp; settings" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16 }}>
        <RSCard style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: RS.ink }}>{name}</Text>
            <Text style={{ fontFamily: MONO, fontSize: 12, color: RS.mid, marginTop: 3 }}>{maskedPhone}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <BloodTag group={group} accent={RS.accent} />
              <View style={[s.badge, { backgroundColor: RS.steal }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: RS.teal }}>ABHA Verified</Text>
              </View>
            </View>
          </View>
        </RSCard>

        <View>
          <RSLabel>Alert settings</RSLabel>
          <RSCard style={{ gap: 0 }}>
            <SettingRow label="Receive emergency alerts" sub="Get push notifications when someone near you needs your blood group." value={alertEnabled} onChange={setAlertEnabled} />
            <View style={s.divider} />
            <SettingRow label="Expand radius to 15 km" sub="By default alerts are for donors within 10 km. Expand when active." value={alertRadius} onChange={setAlertRadius} />
          </RSCard>
        </View>

        <View>
          <RSLabel>ABHA &amp; privacy</RSLabel>
          <RSCard style={{ gap: 0 }}>
            <SettingRow label="Share ABHA health records" sub="Hospitals can view your donation history and screening results for faster matching." value={shareAbha} onChange={setShareAbha} />
            <View style={s.divider} />
            <SettingRow label="Keep identity anonymous" sub="Patients only see your first name and blood group. Phone is always masked." value={anonymize} onChange={setAnonymize} />
          </RSCard>
        </View>

        <RSCard style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: RS.mid, lineHeight: 18 }}>
            Your ABHA ID and donation records are stored on NHA servers under IT Act 2000. VitalLink cannot access your health records without explicit consent.
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
  logoutBtn: { borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
});
