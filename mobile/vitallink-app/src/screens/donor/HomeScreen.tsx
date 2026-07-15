import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import Drop from '../../components/Drop';
import PulseDot from '../../components/PulseDot';
import RSCard from '../../components/RSCard';
import BloodTag from '../../components/BloodTag';
import api from '../../api/api';

type Props = { navigation: NativeStackNavigationProp<any> };

type Profile = { donor_id: string; name: string; blood_group: string; reliability_score: number; donation_count: number; is_available: boolean };

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localName, setLocalName] = useState('Donor');
  const [localGroup, setLocalGroup] = useState('O+');
  const [available, setAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const [n, g] = await Promise.all([AsyncStorage.getItem('donor_name'), AsyncStorage.getItem('donor_group')]);
    if (n) setLocalName(n);
    if (g) setLocalGroup(g);
    try {
      const donorId = await AsyncStorage.getItem('donor_id');
      const res = await api.get(`/donors/${donorId}`);
      setProfile(res.data);
      setAvailable(res.data.is_available);
      await AsyncStorage.setItem('cached_profile', JSON.stringify(res.data));
    } catch {
      const c = await AsyncStorage.getItem('cached_profile');
      if (c) { const p = JSON.parse(c); setProfile(p); setAvailable(p.is_available); }
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  const registerPush = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const token = await Notifications.getExpoPushTokenAsync();
      // Backend endpoint uses JWT to identify the donor — token is sent via Authorization header by api instance
      await api.post('/donors/push-token', { push_token: token.data });
    } catch {}
  }, []);

  useEffect(() => { load(); registerPush(); }, [load, registerPush]);

  const handleToggle = async (val: boolean) => {
    setToggling(true);
    const prev = available;
    setAvailable(val);
    try {
      const donorId = await AsyncStorage.getItem('donor_id');
      await api.patch(`/donors/${donorId}/availability`, { availability: val });
    } catch { setAvailable(prev); }
    finally { setToggling(false); }
  };

  const count = profile?.donation_count ?? 0;
  const score = profile?.reliability_score ?? 0;
  const nextEligible = 'Aug 14, 2025';

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <View style={s.header}>
        <Drop size={16} color={RS.accent} />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>VitalLink</Text>
          <Text style={s.headerSub}>Donor dashboard</Text>
        </View>
        <BloodTag group={profile?.blood_group ?? localGroup} accent={RS.accent} />
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={RS.accent} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={RS.accent} />}>
          <Text style={s.greeting}>Namaste, {profile?.name ?? localName}</Text>
          <RSCard style={[s.availCard, { borderColor: available ? RS.teal : RS.line }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: RS.ink }}>
                {available ? 'Available for donation' : 'Currently unavailable'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {available && <PulseDot color={RS.teal} size={7} />}
                <Text style={{ fontSize: 11.5, color: available ? RS.teal : RS.faint, fontWeight: '600' }}>
                  {available ? 'You will receive emergency alerts' : 'Toggle to start receiving alerts'}
                </Text>
              </View>
            </View>
            {toggling ? <ActivityIndicator color={RS.teal} /> :
              <Switch value={available} onValueChange={handleToggle}
                trackColor={{ false: RS.line, true: RS.steal }} thumbColor={available ? RS.teal : RS.faint} />}
          </RSCard>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              ['Donations', String(count), RS.accent, RS.soft],
              ['Reliability', `${score}%`, RS.teal, RS.steal],
              ['Lives saved', String(Math.floor(count * 1.4)), RS.amber, RS.samber],
            ].map(([label, val, fg, bg]) => (
              <View key={label} style={[s.stat, { backgroundColor: bg }]}>
                <Text style={[s.statVal, { color: fg }]}>{val}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <RSCard style={{ gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: RS.faint, textTransform: 'uppercase' }}>Last donation</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: RS.ink }}>Apollo Hospital, Ludhiana</Text>
              <View style={{ backgroundColor: RS.steal, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: RS.teal }}>Done</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11.5, color: RS.mid }}>Jun 14, 2025 · O+ · 1 unit</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: RS.line, paddingTop: 8 }}>
              <Text style={{ fontSize: 11.5, color: RS.mid }}>Next eligible: </Text>
              <Text style={{ fontFamily: MONO, fontWeight: '700', fontSize: 11.5, color: RS.ink }}>{nextEligible}</Text>
            </View>
          </RSCard>
        </ScrollView>
      )}
      <View style={s.bottomNav}>
        {([['home', 'Home'], ['history', 'History'], ['profile', 'Profile']] as const).map(([id, label]) => (
          <TouchableOpacity key={id} style={s.navItem} onPress={() => {
            if (id === 'history') navigation.navigate('DonorHistory');
            else if (id === 'profile') navigation.navigate('Profile');
            else setActiveTab('home');
          }}>
            <View style={[s.navDot, { backgroundColor: activeTab === id ? RS.accent : RS.faint }]} />
            <Text style={[s.navLabel, { color: activeTab === id ? RS.accent : RS.faint, fontWeight: activeTab === id ? '700' : '500' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12, backgroundColor: RS.white, borderBottomWidth: 1, borderBottomColor: RS.line },
  headerTitle: { fontSize: 15, fontWeight: '700', color: RS.ink, letterSpacing: -0.2 },
  headerSub: { fontSize: 11.5, color: RS.mid },
  greeting: { fontSize: 22, fontWeight: '700', color: RS.ink, letterSpacing: -0.4, lineHeight: 28 },
  availCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5 },
  stat: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontFamily: MONO, fontWeight: '700', fontSize: 22 },
  statLabel: { fontSize: 10.5, color: RS.mid, marginTop: 3 },
  bottomNav: { flexDirection: 'row', backgroundColor: RS.white, borderTopWidth: 1, borderTopColor: RS.line, paddingBottom: 4 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 },
  navDot: { width: 6, height: 6, borderRadius: 3 },
  navLabel: { fontSize: 10.5 },
});
