import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Importar las pantallas
import AuthScreen from './src/screens/auth_screen';
import CampusMapScreen from './src/screens/campus_map_screen';
import BuildingDashboard from './src/screens/building_dashboard';
import PasswordRecoveryScreen from './src/screens/password_recovery_screen';
import authService from './lib/auth';

const Stack = createStackNavigator();

import useEnableBodyScroll from './src/hooks/useEnableBodyScroll';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Auth');

  // Habilitar scroll en el body (web)
  useEnableBodyScroll();
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Verificando sesión al iniciar app...');
      try {
        const isAuthenticated = await authService.isUserAuthenticated();
        console.log('✅ Resultado de autenticación:', isAuthenticated);
        
        if (isAuthenticated) {
          setInitialRoute('CampusMap');
          console.log('📍 Usuario autenticado, iniciando en CampusMap');
        } else {
          setInitialRoute('Auth');
          console.log('🔐 No hay sesión, iniciando en Login');
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setInitialRoute('Auth');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e40af' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }
  
  console.log('Energy Monitor Admin Dashboard starting... Ruta inicial:', initialRoute);
  
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1e40af" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
        />
        <Stack.Screen 
          name="PasswordRecovery" 
          component={PasswordRecoveryScreen} 
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
