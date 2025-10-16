import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Importar las pantallas
import AuthScreen from './src/screens/auth_screen';
import CampusMapScreen from './src/screens/campus_map_screen';
import BuildingDashboard from './src/screens/building_dashboard';

const Stack = createStackNavigator();

import useEnableBodyScroll from './src/hooks/useEnableBodyScroll';

export default function App() {
  // Habilitar scroll en el body (web)
  useEnableBodyScroll();
  console.log('Energy Monitor Admin Dashboard starting...');
  
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1e40af" />
      <Stack.Navigator 
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
        />
        <Stack.Screen 
          name="CampusMap" 
          component={CampusMapScreen} 
        />
        <Stack.Screen 
          name="BuildingDashboard" 
          component={BuildingDashboard} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
