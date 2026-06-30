import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import Drop from '../components/Drop';
import PulseDot from '../components/PulseDot';
import RSCard from '../components/RSCard';
import RSBtn from '../components/RSBtn';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function HomeScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'banks' | 'requests' | 'profile'>('home');

  useEffect(() => {
    AsyncStorage.getItem('patient_name').then(n => setName(n ?? 'User'));
  }, []);

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'banks', label: 'Blood Banks' },
    { id: 'requests', label: 'Requests' },
    { id: 'profile', label: 'Profile' },
  ] as const;

  const renderTab = () => {
    switch (activeTab) {
      case 'banks': navigation.navigate('BloodBanks'); setActiveTab('home'); return null;
      case 'requests': navigation.navigate('History'); setActiveTab('home'); return null;
      case 'profile': navigation.navigate('Profile'); setActiveTab('home'); return null;
      default: return null;
    }
  };

  renderTab();

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      {/* App Header */}
      <View style={s.header}>
        <Drop size={16} color={RS.accent} />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>VitalLink</Text>
          <Text style={s.headerSub}>Ludhiana, Punjab</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <PulseDot color={RS.teal} size={7} />
          <Text style={{ fontSize: 11.5, color: RS.teal, fontWeight: '600' }}>12,480 donors nearby</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={s.greeting}>Namaste, {name} 🙏</Text>

        {/* Emergency CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Need blood urgently?</Text>
          <Text style={s.ctaSub}>Verified donors near you are alerted in under 90 seconds.</Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => navigation.navigate('CreateRequest')}
            activeOpacity={0.85}
          >
            <Drop size={13} color={RS.accent} />
            <Text style={s.ctaBtnText}>Request blood now</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={s.gridCard} onPress={() => navigation.navigate('BloodBanks')} activeOpacity={0.8}>
            <Text style={s.gridTitle}>Blood banks</Text>
            <Text style={s.gridSub}>9 nearby · live stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.gridCard} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
            <Text style={s.gridTitle}>My requests</Text>
            <Text style={s.gridSub}>No active requests</Text>
          </TouchableOpacity>
        </View>

        {/* SMS fallback */}
        <RSCard style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={s.smsBadge}><Text style={s.smsBadgeText}>SMS</Text></View>
          <Text style={{ fontSize: 11.5, color: RS.mid, flex: 1, lineHeight: 17 }}>
            No internet? Dial <Text style={{ fontFamily: MONO, color: RS.ink, fontWeight: '700' }}>*BLOOD#</Text> or send a missed call — same network, any phone.
          </Text>
        </RSCard>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity key={t.id} style={s.navItem} onPress={() => {
              if (t.id === 'banks') navigation.navigate('BloodBanks');
              else if (t.id === 'requests') navigation.navigate('History');
              else if (t.id === 'profile') navigation.navigate('Profile');
              else setActiveTab('home');
            }}>
              <View style={[s.navDot, { backgroundColor: isActive ? RS.accent : RS.faint }]} />
              <Text style={[s.navLabel, { color: isActive ? RS.accent : RS.faint, fontWeight: isActive ? '700' : '500' }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    backgroundColor: RS.white, borderBottomWidth: 1, borderBottomColor: RS.line,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: RS.ink, letterSpacing: -0.2 },
  headerSub: { fontSize: 11.5, color: RS.mid },
  greeting: { fontSize: 22, fontWeight: '700', color: RS.ink, letterSpacing: -0.4, lineHeight: 28 },
  cta: {
    backgroundColor: RS.deep, borderRadius: 18, padding: 22,
    shadowColor: RS.accent, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.24, shadowRadius: 34, elevation: 8,
  },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: RS.white, marginBottom: 4 },
  ctaSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: 16 },
  ctaBtn: {
    backgroundColor: RS.white, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: RS.accent },
  gridCard: {
    flex: 1, backgroundColor: RS.white, borderWidth: 1, borderColor: RS.line,
    borderRadius: 14, padding: 14,
  },
  gridTitle: { fontSize: 13.5, fontWeight: '600', color: RS.ink, marginBottom: 2 },
  gridSub: { fontSize: 11.5, color: RS.mid },
  smsBadge: { backgroundColor: RS.steal, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  smsBadgeText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: RS.teal },
  bottomNav: {
    flexDirection: 'row', backgroundColor: RS.white,
    borderTopWidth: 1, borderTopColor: RS.line, paddingBottom: 4,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 },
  navDot: { width: 6, height: 6, borderRadius: 3 },
  navLabel: { fontSize: 10.5 },
});
