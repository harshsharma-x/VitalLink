import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'donor' | 'patient'>('patient');

  // Shared
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Donor-specific
  const [group, setGroup] = useState('O+');
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertRadius, setAlertRadius] = useState(true);
  const [shareAbha, setShareAbha] = useState(true);
  const [anonymizeDonor, setAnonymizeDonor] = useState(false);

  // Patient-specific
  const [abdm, setAbdm] = useState(true);
  const [disha, setDisha] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [anonymizePatient, setAnonymizePatient] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await AsyncStorage.getItem('user_role');
      const roleVal = r === 'donor' ? 'donor' : 'patient';
      setRole(roleVal);

      if (roleVal === 'donor') {
        const [n, g, e] = await Promise.all([
          AsyncStorage.getItem('donor_name'),
          AsyncStorage.getItem('donor_group'),
          AsyncStorage.getItem('donor_email'),
        ]);
        if (n) setName(n);
        if (g) setGroup(g);
        if (e) setEmail(e);
      } else {
        const [n, e] = await Promise.all([
          AsyncStorage.getItem('patient_name'),
          AsyncStorage.getItem('patient_email'),
        ]);
        if (n) setName(n);
        if (e) setEmail(e);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    const keys = [
      'access_token', 'user_role', 'user_id',
      'donor_id', 'donor_name', 'donor_email', 'donor_group', 'cached_profile', 'cached_donations',
      'patient_id', 'patient_name', 'patient_email', 'cached_requests',
    ];
    await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
    navigation.replace('RoleSelect');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: RS.fog, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={RS.accent} />
      </View>
    );
  }

  const displayId = email || 'Signed in with Google';

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader
        accent={RS.accent}
        name="Profile"
        sub={role === 'donor' ? 'Donor settings & ABHA' : 'Privacy & health data'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16 }}>
        {/* Identity card */}
        <RSCard style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: RS.ink }}>{name || 'User'}</Text>
            <Text style={{ fontFamily: MONO, fontSize: 11.5, color: RS.mid, marginTop: 3 }} numberOfLines={1}>{displayId}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              {role === 'donor' && (
                <>
                  <BloodTag group={group} accent={RS.accent} />
                  <View style={[s.badge, { backgroundColor: RS.steal }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: RS.teal }}>Donor</Text>
                  </View>
                </>
              )}
              {role === 'patient' && (
                <View style={[s.badge, { backgroundColor: RS.soft }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: RS.accent }}>Patient</Text>
                </View>
              )}
            </View>
          </View>
        </RSCard>

        {/* Donor-specific settings */}
        {role === 'donor' && (
          <>
            <View>
              <RSLabel>Alert settings</RSLabel>
              <RSCard style={{ gap: 0 }}>
                <SettingRow label="Receive emergency alerts" sub="Get push notifications when someone near you needs your blood group." value={alertEnabled} onChange={setAlertEnabled} />
                <View style={s.divider} />
                <SettingRow label="Expand radius to 15 km" sub="By default alerts are for donors within 10 km." value={alertRadius} onChange={setAlertRadius} />
              </RSCard>
            </View>
            <View>
              <RSLabel>ABHA &amp; privacy</RSLabel>
              <RSCard style={{ gap: 0 }}>
                <SettingRow label="Share ABHA health records" sub="Hospitals can view your donation history for faster matching." value={shareAbha} onChange={setShareAbha} />
                <View style={s.divider} />
                <SettingRow label="Keep identity anonymous" sub="Patients only see your first name and blood group." value={anonymizeDonor} onChange={setAnonymizeDonor} />
              </RSCard>
            </View>
          </>
        )}

        {/* Patient-specific settings */}
        {role === 'patient' && (
          <>
            <View>
              <RSLabel>ABDM consent</RSLabel>
              <RSCard style={{ gap: 0 }}>
                <SettingRow label="Share health records via ABHA" sub="Doctors can pull your blood type and Hb from ABDM during an emergency." value={abdm} onChange={setAbdm} />
                <View style={s.divider} />
                <SettingRow label="DISHA data rights" sub="Request a full export or deletion of your data under the Digital Information Security in Healthcare Act." value={disha} onChange={setDisha} />
              </RSCard>
            </View>
            <View>
              <RSLabel>Privacy</RSLabel>
              <RSCard style={{ gap: 0 }}>
                <SettingRow label="Share approximate location" sub="Only shared during an active request. Precise coordinates are never logged." value={shareLocation} onChange={setShareLocation} />
                <View style={s.divider} />
                <SettingRow label="Mask my identity from donors" sub="Donors see the hospital, not your name or number." value={anonymizePatient} onChange={setAnonymizePatient} />
              </RSCard>
            </View>
          </>
        )}

        {/* Compliance notice */}
        <RSCard style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: RS.mid, lineHeight: 18 }}>
            Your data is stored on Indian servers under IT Act 2000. VitalLink does not sell or share your health data with third parties.
          </Text>
          <View style={s.badge}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: RS.amber }}>DISHA compliant · NHA partner</Text>
          </View>
        </RSCard>

        {/* Logout */}
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
