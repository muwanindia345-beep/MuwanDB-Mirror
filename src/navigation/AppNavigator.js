import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConsoleScreen from '../screens/ConsoleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getSession } from '../storage/auth';
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  useEffect(() => { getSession().then(s => setInitialRoute(s.user ? 'Dashboard' : 'Auth')); }, []);
  if (!initialRoute) return <View style={{ flex:1, backgroundColor:'#0a0a0a', justifyContent:'center', alignItems:'center' }}><ActivityIndicator color="#00ff88" size="large" /></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerStyle:{backgroundColor:'#111'}, headerTintColor:'#00ff88', headerTitleStyle:{fontWeight:'800'}, contentStyle:{backgroundColor:'#0a0a0a'} }}>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown:false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title:'MuwanDB', headerBackVisible:false }} />
        <Stack.Screen name="Console" component={ConsoleScreen} options={{ title:'Console' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title:'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
