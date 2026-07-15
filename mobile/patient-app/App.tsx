import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateRequestScreen from './src/screens/CreateRequestScreen';
import SearchingScreen from './src/screens/SearchingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BloodBanksScreen from './src/screens/BloodBanksScreen';
import ProfileScreen from './src/screens/ProfileScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef<any>(null);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'VitalLink',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C0152A',
        sound: 'default',
      });
    }

    const handleData = (data: any) => {
      if (!navigationRef.current) return;
      if (data?.type === 'donor_accepted') {
        navigationRef.current.navigate('Tracking', {
          blood_group: data.blood_group,
          request_id: data.request_id,
          match_id: data.match_id,
          donor_name: data.donor_name,
          donor_group: data.donor_blood_group,
          reliability_score: data.reliability_score ?? 0,
          donation_count: data.donation_count ?? 0,
        });
      }
    };

    notifListener.current = Notifications.addNotificationReceivedListener(n => {
      handleData(n.request.content.data);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(r => {
      handleData(r.notification.request.content.data);
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
        <Stack.Screen
          name="Searching"
          component={SearchingScreen as any}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen name="Tracking" component={TrackingScreen as any} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="BloodBanks" component={BloodBanksScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
