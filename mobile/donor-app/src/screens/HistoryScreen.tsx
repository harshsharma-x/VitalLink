import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import RSAppHeader from '../components/RSAppHeader';
import BloodTag from '../components/BloodTag';
import api from '../api/api';

type Props = { navigation: NativeStackNavigationProp<any> };
type Donation = { id: string; blood_group: string; hospital: string; date: string; status: string; units?: number };

const STATUS: Record<string, [string, string, string]> = {
  completed: ['Done', RS.teal, RS.steal],
  accepted:  ['Live', RS.accent, RS.soft],
  declined:  ['Declined', RS.faint, RS.fog],
  pending:   ['Pending', RS.amber, RS.samber],
};

const MILESTONES = [1, 5, 10, 25, 50];

export default function HistoryScreen({ navigation }: Props) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const donorId = await AsyncStorage.getItem('donor_id');
      const res = await api.get(`/donors/${donorId}/donations`);
      const data = res.data ?? [];
      setDonations(data);
      setError(false);
      await AsyncStorage.setItem('cached_donations', JSON.stringify(data));
    } catch {
      const c = await AsyncStorage.getItem('cached_donations');
      if (c) setDonations(JSON.parse(c));
      else setError(true);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const count = donations.filter(d => d.status === 'completed').length;
  const nextMilestone = MILESTONES.find(m => m > count) ?? MILESTONES[MILESTONES.length - 1];
  const progress = count / nextMilestone;

  const fmt = (s: string) => {
    try { return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return s; }
  };

  const renderItem = ({ item, index }: { item: Donation; index: number }) => {
    const [label, fg, bg] = STATUS[item.status] ?? STATUS.pending;
    return (
      <View style={s.timelineItem}>
        <View style={{ alignItems: 'center', width: 32 }}>
          <View style={[s.dot, { backgroundColor: item.status === 'completed' ? RS.teal : RS.line }]} />
          {index < donations.length - 1 && <View style={s.line} />}
        </View>
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BloodTag group={item.blood_group} accent={RS.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: RS.ink }}>{item.hospital}</Text>
              <Text style={{ fontSize: 11, color: RS.mid, marginTop: 2 }}>{fmt(item.date)}{item.units ? ` · ${item.units}u` : ''}</Text>
            </View>
            <View style={[s.pill, { backgroundColor: bg, borderColor: fg }]}>
              <Text style={[s.pillText, { color: fg }]}>{label}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Donation history" sub="Your impact timeline" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={RS.accent} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 13.5, color: RS.mid }}>No connection and no cached data</Text>
          <TouchableOpacity onPress={() => load()} style={[s.pill, { borderColor: RS.accent, paddingHorizontal: 20, paddingVertical: 10 }]}>
            <Text style={{ color: RS.accent, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 18, gap: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={RS.accent} />}
          ListHeaderComponent={
            <View style={[s.milestoneCard, { marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                  <Text style={{ fontFamily: MONO, fontSize: 32, fontWeight: '700', color: RS.white }}>{count}</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>donations completed</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Next milestone</Text>
                  <Text style={{ fontFamily: MONO, fontWeight: '700', fontSize: 20, color: RS.white }}>{nextMilestone}</Text>
                </View>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${Math.min(100, Math.round(progress * 100))}%` as any }]} />
              </View>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                {nextMilestone - count} more to reach your next milestone
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: RS.ink }}>No donations yet</Text>
              <Text style={{ fontSize: 12.5, color: RS.mid }}>Accept an emergency alert to start your timeline</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  milestoneCard: {
    borderRadius: 18, padding: 18, overflow: 'hidden',
    backgroundColor: RS.accent,
    shadowColor: RS.accent, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 8,
  },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: RS.white },
  timelineItem: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 14 },
  line: { width: 2, flex: 1, backgroundColor: RS.line, marginTop: 2 },
  card: { flex: 1, backgroundColor: RS.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: RS.line },
  pill: { borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 3, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 10.5, fontWeight: '700' },
});
