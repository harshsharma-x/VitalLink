import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RS, MONO } from '../theme/RS';
import PulseDot from '../components/PulseDot';
import RouteMap from '../components/RouteMap';
import api from '../api/api';
import { SOCKET_URL } from '../config';

type Coords = { latitude: number; longitude: number };
type Props = { navigation: NativeStackNavigationProp<any>; route: RouteProp<{ Navigation: { request_id: string; match_id: string; hospital: string; hospital_lat?: number; hospital_lng?: number } }, 'Navigation'> };

export default function NavigationScreen({ navigation, route }: Props) {
  const { request_id, hospital, hospital_lat, hospital_lng } = route.params;
  const [distance, setDistance] = useState('Calculating…');
  const [eta, setEta] = useState('—');
  const [progress, setProgress] = useState(0);
  const [arriving, setArriving] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const startDistRef = useRef<number | null>(null);

  const hospitalCoords: Coords | null = hospital_lat && hospital_lng ? { latitude: hospital_lat, longitude: hospital_lng } : null;

  const calcDist = (a: Coords, b: Coords) => {
    const R = 6371;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const aa = Math.sin(dLat/2)**2 + Math.cos(a.latitude*Math.PI/180)*Math.cos(b.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  };

  const emitLocation = useCallback((coords: Coords) => {
    socketRef.current?.connected && socketRef.current.emit('donor_location', { request_id, ...coords });
    if (hospitalCoords) {
      const dist = calcDist(coords, hospitalCoords);
      setDistance(dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`);
      const etaMins = Math.round(dist / 30 * 60);
      setEta(etaMins <= 0 ? 'Arriving' : `${etaMins} min`);
      if (startDistRef.current === null) startDistRef.current = dist;
      if (startDistRef.current > 0) setProgress(Math.min(1, 1 - dist / startDistRef.current));
    }
  }, [request_id, hospitalCoords]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Required', 'Location needed for navigation.'); return; }
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        emitLocation({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
        watchRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          loc => emitLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
        );
      } catch { Alert.alert('Error', 'Could not access location.'); }
    })();
    return () => { watchRef.current?.remove(); socketRef.current?.disconnect(); };
  }, [emitLocation]);

  const handleArrived = () => {
    Alert.alert('Confirm Arrival', 'Mark this donation as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: "Yes, I've Arrived", onPress: async () => {
        setArriving(true);
        try {
          await api.patch(`/requests/${request_id}/status`, { status: 'completed' });
          navigation.replace('Donation', { request_id });
        } catch { Alert.alert('Error', 'Could not update status.'); setArriving(false); }
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <RouteMap progress={progress} accent={RS.accent} arrived={progress >= 0.95} height={undefined as any} />
        <View style={s.chipWrapper} pointerEvents="none">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: RS.ink, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100 }}>
            <PulseDot color={RS.white} size={7} />
            <Text style={{ color: RS.white, fontSize: 12, fontWeight: '600' }}>Sharing live location</Text>
          </View>
        </View>
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={{ fontSize: 13.5, fontWeight: '600', color: RS.ink, marginBottom: 10 }}>🏥  {hospital}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={s.stat}>
            <Text style={s.statLabel}>ETA</Text>
            <Text style={[s.statVal, { color: RS.teal }]}>{eta}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Distance</Text>
            <Text style={s.statVal}>{distance}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: RS.faint, marginBottom: 14 }}>Your precise GPS coordinates are being shared with the hospital every 5 seconds.</Text>
        <TouchableOpacity style={[s.arrivedBtn, arriving && { opacity: 0.5 }]} onPress={handleArrived} disabled={arriving} activeOpacity={0.8}>
          {arriving ? <ActivityIndicator color={RS.white} /> : <Text style={{ color: RS.white, fontSize: 15, fontWeight: '700' }}>I've Arrived at the Hospital</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  chipWrapper: { position: 'absolute', top: 12, left: 12, right: 12, alignItems: 'center' },
  sheet: { backgroundColor: RS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, marginTop: -16, padding: 18, paddingBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: RS.line, alignSelf: 'center', marginBottom: 14 },
  stat: { flex: 1, backgroundColor: RS.fog, borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: RS.faint },
  statVal: { fontFamily: MONO, fontWeight: '700', fontSize: 20, color: RS.ink, marginTop: 2 },
  arrivedBtn: { backgroundColor: RS.teal, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
});
