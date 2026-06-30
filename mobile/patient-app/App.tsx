import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateRequestScreen from './src/screens/CreateRequestScreen';
import SearchingScreen from './src/screens/SearchingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BloodBanksScreen from './src/screens/BloodBanksScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
