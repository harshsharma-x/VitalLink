import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Modal, FlatList, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import RSAppHeader from '../../components/RSAppHeader';
import RSBtn from '../../components/RSBtn';
import RSLabel from '../../components/RSLabel';
import api from '../../api/api';

type Props = { navigation: NativeStackNavigationProp<any> };

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const URGENCIES: Array<[string, string, string, string]> = [
  ['critical',  'Critical — now',  RS.soft,   RS.accent],
  ['day',       'Within 24 hrs',   RS.samber,  RS.amber],
  ['planned',   'Planned',         RS.steal,   RS.teal],
];

type Hospital = { id: string | number; name: string; address: string; distance_km: number };

export default function CreateRequestScreen({ navigation }: Props) {
  const [group, setGroup] = useState('O+');
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState('critical');
  const [loading, setLoading] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Fallback to hardcoded
          setHospitals([{ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 }]);
          setSelectedHospital({ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;
        setCoords({ lat, lon });

        const res = await api.get(`/hospitals/nearby?lat=${lat}&lon=${lon}&radius_km=10&limit=15`);
        const list: Hospital[] = res.data ?? [];
        if (list.length > 0) {
          setHospitals(list);
          setSelectedHospital(list[0]);
        } else {
          setHospitals([{ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 }]);
          setSelectedHospital({ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 });
        }
      } catch {
        setHospitals([{ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 }]);
        setSelectedHospital({ id: 'fallback', name: 'Apollo Hospital, Ludhiana', address: 'Ludhiana, Punjab', distance_km: 0 });
      } finally {
        setLoadingHospitals(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!selectedHospital) return;
    setLoading(true);
    try {
      const res = await api.post('/requests/', {
        blood_group: group,
        units_required: units,
        hospital_name: selectedHospital.name,
        hospital_address: selectedHospital.address,
        latitude: coords?.lat,
        longitude: coords?.lon,
        urgency,
      });
      const request_id = res.data?.id ?? res.data?.request_id;
      navigation.replace('Searching', { blood_group: group, units, urgency, request_id });
    } catch {
      navigation.replace('Searching', { blood_group: group, units, urgency });
    } finally {
      setLoading(false);
    }
  };

  const fmtDist = (km: number) => km === 0 ? '' : km < 1 ? ` · ${Math.round(km * 1000)} m` : ` · ${km.toFixed(1)} km`;

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Emergency request" sub="Step 1 of 1 — takes ~30 seconds" onBack={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16 }}>
        {/* Blood group */}
        <View>
          <RSLabel>Blood group needed</RSLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GROUPS.map(g => (
              <TouchableOpacity key={g} onPress={() => setGroup(g)}
                style={[s.groupBtn, { borderColor: g === group ? RS.accent : RS.line, backgroundColor: g === group ? RS.soft : RS.white, width: '23%' }]}>
                <Text style={[s.groupText, { color: g === group ? RS.accent : RS.mid }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Units */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <RSLabel>Units needed</RSLabel>
            <View style={s.stepper}>
              <TouchableOpacity onPress={() => setUnits(Math.max(1, units - 1))} style={s.stepBtn}>
                <Text style={s.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={s.stepVal}>{units}</Text>
              <TouchableOpacity onPress={() => setUnits(Math.min(6, units + 1))} style={s.stepBtn}>
                <Text style={s.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <RSLabel>Patient Hb</RSLabel>
            <View style={[s.stepper, { justifyContent: 'center' }]}>
              <Text style={{ fontFamily: MONO, fontWeight: '600', fontSize: 14, color: RS.ink }}>6.8 g/dL</Text>
            </View>
          </View>
        </View>

        {/* Hospital picker */}
        <View>
          <RSLabel>Hospital</RSLabel>
          <TouchableOpacity style={s.hospitalBtn} onPress={() => setShowPicker(true)} activeOpacity={0.75} disabled={loadingHospitals}>
            {loadingHospitals ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" color={RS.accent} />
                <Text style={{ fontSize: 13, color: RS.mid }}>Finding nearby hospitals…</Text>
              </View>
            ) : selectedHospital ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: RS.accent, flexShrink: 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: RS.ink }}>{selectedHospital.name}</Text>
                  <Text style={{ fontSize: 11, color: RS.mid, marginTop: 2 }}>
                    {selectedHospital.address}{fmtDist(selectedHospital.distance_km)}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: RS.teal, fontWeight: '600' }}>Change</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: RS.mid }}>Tap to select a hospital</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Urgency */}
        <View>
          <RSLabel>How urgent?</RSLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {URGENCIES.map(([id, label, bg, fg]) => (
              <TouchableOpacity key={id} onPress={() => setUrgency(id)}
                style={[s.urgencyBtn, { borderColor: urgency === id ? fg : RS.line, backgroundColor: urgency === id ? bg : RS.white }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: urgency === id ? fg : RS.mid, textAlign: 'center' }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={s.privacy}>Your phone number stays masked. Donors see only the hospital location.</Text>
      </ScrollView>

      <View style={{ padding: 18, paddingBottom: 24, backgroundColor: RS.white, borderTopWidth: 1, borderTopColor: RS.line }}>
        <RSBtn onPress={handleSubmit} accent={RS.accent} big loading={loading} disabled={!selectedHospital || loadingHospitals}>
          Send emergency request
        </RSBtn>
      </View>

      {/* Hospital picker modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPicker(false)}>
        <View style={{ flex: 1, backgroundColor: RS.fog }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select hospital</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: RS.accent }}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={hospitals}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.hospitalRow, selectedHospital?.id === item.id && { borderColor: RS.accent, backgroundColor: RS.soft }]}
                onPress={() => { setSelectedHospital(item); setShowPicker(false); }}
                activeOpacity={0.75}
              >
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: selectedHospital?.id === item.id ? RS.accent : RS.faint, flexShrink: 0, marginTop: 3 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: RS.ink }}>{item.name}</Text>
                  <Text style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }}>{item.address}{fmtDist(item.distance_km)}</Text>
                </View>
                {selectedHospital?.id === item.id && (
                  <Text style={{ color: RS.accent, fontSize: 18, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ color: RS.mid, fontSize: 13.5 }}>No hospitals found nearby</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  groupBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  groupText: { fontFamily: MONO, fontWeight: '700', fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line, borderRadius: 10, overflow: 'hidden' },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 9 },
  stepBtnText: { fontSize: 18, color: RS.mid },
  stepVal: { flex: 1, textAlign: 'center', fontFamily: MONO, fontWeight: '700', fontSize: 16, color: RS.ink },
  hospitalBtn: { backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, padding: 14 },
  hospitalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, padding: 14 },
  urgencyBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' },
  privacy: { fontSize: 11, color: RS.faint, lineHeight: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, paddingTop: 20, backgroundColor: RS.white, borderBottomWidth: 1, borderBottomColor: RS.line },
  modalTitle: { fontSize: 16, fontWeight: '700', color: RS.ink },
});
