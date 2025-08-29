import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Importar las pantallas (sin LoginScreen)
import CampusMapScreen from './src/screens/campus_map_screen';
import BuildingDashboard from './src/screens/building_dashboard';

const Stack = createStackNavigator();

export default function App() {
  console.log('Energy Monitor Admin Dashboard starting...');
  
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1e40af" />
      <Stack.Navigator 
        initialRouteName="CampusMap"
        screenOptions={{
          headerShown: false,
        }}
      >
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
