import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RS, MONO } from '../../theme/RS';
import Drop from '../../components/Drop';
import api from '../../api/api';

type AlertData = { type: string; request_id: string; match_id: string; blood_group: string; hospital: string; hospital_lat?: number; hospital_lng?: number; units?: number };
type Props = { navigation: NativeStackNavigationProp<any>; route: RouteProp<{ EmergencyAlert: { alertData: AlertData } }, 'EmergencyAlert'> };

export default function EmergencyAlertScreen({ navigation, route }: Props) {
  const { alertData } = route.params;
  const [distance, setDistance] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeRing = (v: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])).start();
    makeRing(ring1, 0); makeRing(ring2, 500); makeRing(ring3, 1000);

    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); navigation.goBack(); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || !alertData.hospital_lat || !alertData.hospital_lng) return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const R = 6371;
        const dLat = ((alertData.hospital_lat - loc.coords.latitude) * Math.PI) / 180;
        const dLon = ((alertData.hospital_lng - loc.coords.longitude) * Math.PI) / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(loc.coords.latitude * Math.PI/180) * Math.cos(alertData.hospital_lat * Math.PI/180) * Math.sin(dLon/2)**2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setDistance(dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`);
      } catch {}
    })();
  }, [alertData]);

  const ringStyle = (v: Animated.Value) => ({
    position: 'absolute' as const, width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: RS.accent,
    transform: [{ scale: v.interpolate({ inputRange: [0,1], outputRange: [1, 2.4] }) }],
    opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.25, 0] }),
  });

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.post('/matching/accept', { match_id: alertData.match_id });
      navigation.replace('Navigation', { request_id: alertData.request_id, match_id: alertData.match_id, hospital: alertData.hospital, hospital_lat: alertData.hospital_lat, hospital_lng: alertData.hospital_lng });
    } catch {
      Alert.alert('Error', 'Could not accept. Try again.');
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try { await api.post('/matching/reject', { match_id: alertData.match_id }); } catch {}
    navigation.goBack();
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: RS.deep, paddingHorizontal: 20, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 28 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#FF6B6B', letterSpacing: 3, marginBottom: 32 }}>EMERGENCY ALERT</Text>
        <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Animated.View style={ringStyle(ring1)} />
          <Animated.View style={ringStyle(ring2)} />
          <Animated.View style={ringStyle(ring3)} />
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: RS.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Drop size={20} color={RS.white} />
          </View>
        </View>
        <Text style={{ fontFamily: MONO, fontSize: 60, fontWeight: '900', color: RS.white, letterSpacing: 2 }}>{alertData.blood_group}</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 1 }}>BLOOD NEEDED</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Text style={{ fontFamily: MONO, fontSize: 22, fontWeight: '700', color: countdown <= 30 ? '#FF6B6B' : 'rgba(255,255,255,0.7)' }}>{mins}:{secs}</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>to respond</Text>
        </View>
      </View>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 28, gap: 0 }}>
        {[
          ['Hospital', alertData.hospital],
          ['Distance', distance ?? 'Calculating…'],
          ['Units needed', `${alertData.units ?? 1} unit${(alertData.units ?? 1) > 1 ? 's' : ''}`],
        ].map(([label, val], i, arr) => (
          <View key={label}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: RS.white }}>{val}</Text>
            </View>
            {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity style={[s.decBtn, (declining || accepting) && { opacity: 0.5 }]} onPress={handleDecline} disabled={declining || accepting}>
          {declining ? <ActivityIndicator color="rgba(255,255,255,0.5)" /> : <Text style={s.decText}>DECLINE</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[s.accBtn, (accepting || declining) && { opacity: 0.5 }]} onPress={handleAccept} disabled={accepting || declining}>
          {accepting ? <ActivityIndicator color={RS.white} /> : <Text style={s.accText}>ACCEPT</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  decBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  decText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  accBtn: { flex: 2, backgroundColor: RS.teal, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  accText: { color: RS.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});
