import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Importar las pantallas
import AuthScreen from './src/screens/auth_screen';
import CampusMapScreen from './src/screens/campus_map_screen';
import BuildingDashboard from './src/screens/building_dashboard';
import PasswordRecoveryScreen from './src/screens/password_recovery_screen';
import MLPredictionScreen from './src/screens/ml_prediction_screen'; // { added }
import PredictionsScreen from './src/screens/predictions_screen';
import authService from './lib/auth';
import CFEReportScreen from './src/screens/cfe_report_screen';

const Stack = createStackNavigator();

import useEnableBodyScroll from './src/hooks/useEnableBodyScroll';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('EF - Autenticación');

  // Habilitar scroll en el body (web)
  useEnableBodyScroll();
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Verificando sesión al iniciar app...');
      try {
        const isAuthenticated = await authService.isUserAuthenticated();
        console.log('✅ Resultado de autenticación:', isAuthenticated);
        
        if (isAuthenticated) {
          setInitialRoute('EF - Mapa del Campus');
          console.log('📍 Usuario autenticado, iniciando en CampusMap');
        } else {
          setInitialRoute('EF - Autenticación');
          console.log('🔐 No hay sesión, iniciando en Login');
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setInitialRoute('EF - Autenticación');
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
    <ThemeProvider>
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#789b6fff" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="EF - Autenticación" 
          component={AuthScreen} 
        />
        <Stack.Screen 
          name="EF - Recuperar Contraseña" 
          component={PasswordRecoveryScreen} 
        />
        <Stack.Screen 
          name="MLPredict"
          component={MLPredictionScreen}
        />
        <Stack.Screen 
          name="Predictions"
          component={PredictionsScreen}
        />
        <Stack.Screen 
          name="EF - Mapa del Campus" 
          component={CampusMapScreen} 
        />
        <Stack.Screen 
          name="EF - Dashboard de Edificio" 
          component={BuildingDashboard} 
        />
        <Stack.Screen 
          name="CFEReport"
          component={CFEReportScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>

  );
}
