import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import EmergencyAlertScreen from './src/screens/EmergencyAlertScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import DonationScreen from './src/screens/DonationScreen';
import CompleteScreen from './src/screens/CompleteScreen';
import HistoryScreen from './src/screens/HistoryScreen';
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
      Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C0152A',
        sound: 'default',
      });
    }

    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as any;
      if (data?.type === 'emergency_alert' && navigationRef.current) {
        navigationRef.current.navigate('EmergencyAlert', { alertData: data });
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'emergency_alert' && navigationRef.current) {
        navigationRef.current.navigate('EmergencyAlert', { alertData: data });
      }
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
        <Stack.Screen name="OTP" component={OTPScreen as any} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmergencyAlert" component={EmergencyAlertScreen as any} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Navigation" component={NavigationScreen as any} />
        <Stack.Screen name="Donation" component={DonationScreen as any} />
        <Stack.Screen name="Complete" component={CompleteScreen as any} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
