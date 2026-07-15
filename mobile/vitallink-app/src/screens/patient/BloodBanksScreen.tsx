import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import * as Location from 'expo-location';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import RSAppHeader from '../../components/RSAppHeader';
import RSCard from '../../components/RSCard';
import RSLabel from '../../components/RSLabel';
import api from '../../api/api';

type Props = { navigation: NativeStackNavigationProp<any> };

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

type StockLevel = 'ok' | 'low' | 'out' | 'unknown';
const LEVEL: Record<StockLevel, [string, string]> = {
  ok:      [RS.teal,   RS.steal],
  low:     [RS.amber,  RS.samber],
  out:     [RS.accent, RS.soft],
  unknown: [RS.faint,  RS.fog],
};

function level(units: number | null | undefined): StockLevel {
  if (units == null) return 'unknown';
  if (units === 0) return 'out';
  if (units < 4) return 'low';
  return 'ok';
}

type Bank = {
  id: string | number;
  name: string;
  address: string;
  distance_km: number;
  rating?: number;
  open_now?: boolean | null;
  maps_url?: string;
  source?: string;
  stock?: Record<string, number> | null;
};

type Hospital = {
  id: string | number;
  name: string;
  address: string;
  distance_km: number;
  rating?: number;
  open_now?: boolean | null;
  maps_url?: string;
  source?: string;
};

type Tab = 'banks' | 'hospitals';

export default function BloodBanksScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('banks');
  const [filter, setFilter] = useState<string | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [locLabel, setLocLabel] = useState('Detecting location…');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Enable it in Settings to see nearby places.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      setCoords({ lat, lon });

      // Reverse geocode for label
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geo[0]) {
        const g = geo[0];
        setLocLabel([g.district ?? g.subregion, g.city].filter(Boolean).join(', ') || 'Your location');
      }

      const [bankRes, hospRes] = await Promise.all([
        api.get(`/bloodbanks/nearby?lat=${lat}&lon=${lon}&radius_km=10&limit=20`),
        api.get(`/hospitals/nearby?lat=${lat}&lon=${lon}&radius_km=10&limit=20`),
      ]);
      setBanks(bankRes.data ?? []);
      setHospitals(hospRes.data ?? []);
    } catch (e: any) {
      setError('Could not load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMaps = (url?: string, name?: string, lat?: number, lon?: number) => {
    const target = url || (lat != null ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : null);
    if (target) Linking.openURL(target);
  };

  const renderBank = (bank: Bank) => {
    const dist = bank.distance_km < 1
      ? `${Math.round(bank.distance_km * 1000)} m`
      : `${bank.distance_km.toFixed(1)} km`;
    const hasStock = bank.stock != null;

    return (
      <RSCard key={String(bank.id)} style={{ gap: 10 }}>
        <TouchableOpacity onPress={() => openMaps(bank.maps_url)} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: RS.ink }}>{bank.name}</Text>
              <Text style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }} numberOfLines={1}>{bank.address}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <View style={s.distBadge}>
                  <Text style={s.distText}>{dist}</Text>
                </View>
                {bank.rating != null && bank.rating > 0 && (
                  <Text style={{ fontSize: 11, color: RS.mid }}>★ {bank.rating.toFixed(1)}</Text>
                )}
                {bank.open_now === true && (
                  <View style={{ backgroundColor: RS.steal, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: RS.teal, fontWeight: '700' }}>Open now</Text>
                  </View>
                )}
                {bank.open_now === false && (
                  <View style={{ backgroundColor: RS.soft, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: RS.accent, fontWeight: '700' }}>Closed</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={{ fontSize: 11, color: RS.teal, fontWeight: '600' }}>Maps ›</Text>
          </View>
        </TouchableOpacity>

        {/* Stock chips */}
        <View style={s.stockGrid}>
          {(filter ? [filter] : GROUPS).map(g => {
            const units = hasStock ? (bank.stock![g] ?? null) : null;
            const lv = level(units);
            const [fg, bg] = LEVEL[lv];
            return (
              <View key={g} style={[s.chip, { backgroundColor: bg, borderColor: fg }]}>
                <Text style={[s.chipGroup, { color: fg }]}>{g}</Text>
                <Text style={[s.chipUnits, { color: fg }]}>
                  {lv === 'unknown' ? '?' : lv === 'out' ? 'Out' : `${units}u`}
                </Text>
              </View>
            );
          })}
        </View>
        {!hasStock && (
          <Text style={{ fontSize: 10.5, color: RS.faint, fontStyle: 'italic' }}>
            Stock data not available — call the bank directly
          </Text>
        )}
      </RSCard>
    );
  };

  const renderHospital = (h: Hospital) => {
    const dist = h.distance_km < 1
      ? `${Math.round(h.distance_km * 1000)} m`
      : `${h.distance_km.toFixed(1)} km`;
    return (
      <RSCard key={String(h.id)} style={{ gap: 6 }}>
        <TouchableOpacity onPress={() => openMaps(h.maps_url)} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: RS.ink }}>{h.name}</Text>
              <Text style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }} numberOfLines={1}>{h.address}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <View style={s.distBadge}>
                  <Text style={s.distText}>{dist}</Text>
                </View>
                {h.rating != null && h.rating > 0 && (
                  <Text style={{ fontSize: 11, color: RS.mid }}>★ {h.rating.toFixed(1)}</Text>
                )}
                {h.open_now === true && (
                  <View style={{ backgroundColor: RS.steal, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: RS.teal, fontWeight: '700' }}>Open now</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={{ fontSize: 11, color: RS.teal, fontWeight: '600' }}>Maps ›</Text>
          </View>
        </TouchableOpacity>
      </RSCard>
    );
  };

  const list = tab === 'banks' ? banks : hospitals;

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name={tab === 'banks' ? 'Blood banks' : 'Hospitals'} sub={locLabel} onBack={() => navigation.goBack()} />

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['banks', 'hospitals'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, { color: tab === t ? RS.accent : RS.mid }]}>
              {t === 'banks' ? 'Blood banks' : 'Hospitals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={RS.accent} />
          <Text style={{ fontSize: 12.5, color: RS.mid }}>Getting your location…</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: RS.ink, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchData()}
            style={{ borderWidth: 1.5, borderColor: RS.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ color: RS.accent, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, gap: 14 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={RS.accent} />}
        >
          {/* Blood group filter — only for banks tab */}
          {tab === 'banks' && (
            <View>
              <RSLabel>Filter by group</RSLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[null, ...GROUPS].map(g => (
                    <TouchableOpacity key={g ?? 'all'} onPress={() => setFilter(g)}
                      style={[s.filterChip, { borderColor: filter === g ? RS.accent : RS.line, backgroundColor: filter === g ? RS.soft : RS.white }]}>
                      <Text style={[s.filterChipText, { color: filter === g ? RS.accent : RS.mid }]}>{g ?? 'All'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {list.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: RS.ink }}>Nothing found nearby</Text>
              <Text style={{ fontSize: 12.5, color: RS.mid, textAlign: 'center' }}>
                Try expanding your search radius or check your internet connection.
              </Text>
            </View>
          ) : (
            tab === 'banks'
              ? banks.map(renderBank)
              : hospitals.map(renderHospital)
          )}

          {/* Legend — banks only */}
          {tab === 'banks' && list.length > 0 && (
            <View style={s.legend}>
              {(['ok', 'low', 'out', 'unknown'] as StockLevel[]).map(lv => {
                const [fg] = LEVEL[lv];
                const labels: Record<StockLevel, string> = { ok: '4+ units', low: '1–3 units', out: 'Out of stock', unknown: 'Unknown' };
                return (
                  <View key={lv} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: fg }} />
                    <Text style={{ fontSize: 10.5, color: RS.mid }}>{labels[lv]}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={{ fontSize: 10.5, color: RS.faint, textAlign: 'center' }}>
            {banks[0]?.source === 'google' ? 'Data from Google Places · tap any card to open in Maps' : 'Data from NBS registry · tap any card to open in Maps'}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: RS.white, borderBottomWidth: 1, borderBottomColor: RS.line },
  tabBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: RS.accent },
  tabText: { fontSize: 13, fontWeight: '600' },
  distBadge: { backgroundColor: RS.fog, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  distText: { fontFamily: MONO, fontSize: 11, fontWeight: '600', color: RS.ink },
  stockGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center', minWidth: 48 },
  chipGroup: { fontFamily: MONO, fontWeight: '700', fontSize: 11 },
  chipUnits: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  filterChip: { borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  filterChipText: { fontFamily: MONO, fontWeight: '700', fontSize: 12 },
  legend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});
