import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import RSAppHeader from '../../components/RSAppHeader';
import BloodTag from '../../components/BloodTag';
import api from '../../api/api';

type Props = { navigation: NativeStackNavigationProp<any> };

type BloodRequest = {
  id: string; blood_group: string; hospital_name: string;
  created_at: string; status: string; units_required: number; urgency_level: string;
};

const STATUS: Record<string, [string, string, string]> = {
  completed: ['Done', RS.teal, RS.steal],
  accepted:  ['Live', RS.accent, RS.soft],
  pending:   ['Searching', RS.amber, RS.samber],
  matching:  ['Matching', RS.amber, RS.samber],
  cancelled: ['Closed', RS.faint, RS.fog],
};

export default function HistoryScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const patientId = await AsyncStorage.getItem('patient_id');
      const response = await api.get(`/requests/?patient_id=${patientId}`);
      const data = response.data ?? [];
      setRequests(data);
      setError(false);
      await AsyncStorage.setItem('cached_requests', JSON.stringify(data));
    } catch {
      const c = await AsyncStorage.getItem('cached_requests');
      if (c) setRequests(JSON.parse(c));
      else setError(true);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (s: string) => {
    try { return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return s; }
  };

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const [label, fg, bg] = STATUS[item.status] ?? STATUS.cancelled;
    return (
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <BloodTag group={item.blood_group} accent={RS.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '700', color: RS.ink }}>{item.hospital_name}</Text>
            <Text style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }}>
              {item.units_required} unit{item.units_required > 1 ? 's' : ''} · {fmt(item.created_at)}
            </Text>
          </View>
          <View style={[s.pill, { backgroundColor: bg, borderColor: fg }]}>
            <Text style={[s.pillText, { color: fg }]}>{label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="My requests" sub="Blood request history" onBack={() => navigation.goBack()} />
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
          data={requests}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 18, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={RS.accent} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 70, gap: 8 }}>
              <View style={[s.emptyDrop, { backgroundColor: RS.soft }]}>
                <Text style={{ color: RS.accent, fontSize: 22, fontWeight: '800' }}>0</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: RS.ink }}>No requests yet</Text>
              <Text style={{ fontSize: 12.5, color: RS.mid }}>Your blood request history will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: RS.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: RS.line,
  },
  pill: {
    borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  pillText: { fontSize: 11, fontWeight: '700' },
  emptyDrop: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
