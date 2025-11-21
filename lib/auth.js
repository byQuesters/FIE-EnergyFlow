import { config } from './config';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detectar automáticamente la URL base según el entorno
const getApiBaseUrl = () => {
  // Primero, verificar variables de entorno explícitas
  const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // Si hay variable de entorno configurada, usarla
  if (EXPO_PUBLIC_API_URL) {
    return EXPO_PUBLIC_API_URL;
  }
  
  if (NEXT_PUBLIC_API_URL) {
    return NEXT_PUBLIC_API_URL;
  }
  
  // En producción (Vercel), usar la URL del dominio actual (solo cuando window.location existe)
  if (
    typeof window !== 'undefined' &&
    window.location &&
    typeof window.location.hostname === 'string' &&
    window.location.hostname !== 'localhost'
  ) {
    return window.location.origin;
  }
  
  // Fallback para desarrollo local según la plataforma
  if (Platform.OS === 'web') {
    // En desarrollo web, por defecto usar producción (Vercel)
    // Para usar local, configurar EXPO_PUBLIC_API_URL en .env
    return 'https://fie-energy-flow.vercel.app';
  } else if (Platform.OS === 'android') {
    // Para emulador de Android, usar 10.0.2.2
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }
  
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📱 Platform:', Platform.OS);

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async login(email, password) {
    try {
      console.log('Attempting login with:', email);

      // MODO DEVELOPMENT: Usar autenticación mock para pruebas
      // Cambiar USE_MOCK_AUTH a false cuando quieras conectarte al servidor real
      const USE_MOCK_AUTH = false; // ✅ MODO REAL ACTIVADO - Conectado al backend Next.js

      if (USE_MOCK_AUTH) {
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validación básica mock
        if (email.includes('@') && password.length >= 6) {
          const mockUser = {
            id: '1',
            email: email,
            name: email.split('@')[0],
          };

          this.user = mockUser;
          this.isAuthenticated = true;
          
          // Guardar datos del usuario en AsyncStorage para persistencia
          try {
            await AsyncStorage.setItem('user', JSON.stringify(mockUser));
            await AsyncStorage.setItem('isAuthenticated', 'true');
          } catch (storageError) {
            console.error('Error saving to storage:', storageError);
          }

          console.log('Mock login successful:', mockUser);
          return { success: true, user: mockUser };
        } else {
          return { 
            success: false, 
            error: email.includes('@') ? 
              'Contraseña muy corta (mínimo 6 caracteres)' : 
              'Email inválido'
          };
        }
      }

      // Código real para conectar al servidor Next.js
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.user = data.user;
        this.isAuthenticated = true;
        
        // Guardar datos del usuario en AsyncStorage para persistencia
        try {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          await AsyncStorage.setItem('isAuthenticated', 'true');
        } catch (storageError) {
          console.error('Error saving to storage:', storageError);
        }

        console.log('Login successful:', data.user);
        return { success: true, user: data.user };
      } else {
        console.error('Login failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Asegúrate de que el servidor Next.js esté ejecutándose en el puerto 3000.' 
      };
    }
  }

  async logout() {
    this.user = null;
    this.isAuthenticated = false;
    
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
    } catch (storageError) {
      console.error('Error removing from storage:', storageError);
    }
    
    return { success: true };
  }

  async getCurrentUser() {
    if (this.user) {
      return this.user;
    }

    // Intentar recuperar usuario de AsyncStorage
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedAuth = await AsyncStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = true;
        return this.user;
      }
    } catch (storageError) {
      console.error('Error reading from storage:', storageError);
    }

    return null;
  }

  async isUserAuthenticated() {
    if (this.isAuthenticated) {
      return true;
    }

    // Verificar AsyncStorage
    try {
      const savedAuth = await AsyncStorage.getItem('isAuthenticated');
      return savedAuth === 'true';
    } catch (storageError) {
      console.error('Error checking authentication:', storageError);
      return false;
    }
  }

  // Método para registro
  async register(userData) {
    try {
      console.log('Attempting registration with:', userData.email);

      // MODO DEVELOPMENT: Usar autenticación mock para pruebas
      const USE_MOCK_AUTH = false; // ✅ MODO REAL ACTIVADO - Conectado al backend Next.js

      if (USE_MOCK_AUTH) {
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validación básica mock
        if (!userData.email || !userData.password || !userData.name) {
          return { 
            success: false, 
            error: 'Todos los campos son requeridos'
          };
        }

        if (userData.password.length < 6) {
          return { 
            success: false, 
            error: 'La contraseña debe tener al menos 6 caracteres'
          };
        }

        const mockUser = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          createdAt: new Date().toISOString(),
        };

        console.log('Mock registration successful:', mockUser);
        return { success: true, data: mockUser };
      }

      // Código real para conectar al servidor Next.js
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Registration successful:', data);
        return { success: true, data };
      } else {
        console.error('Registration failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Asegúrate de que el servidor esté ejecutándose.' 
      };
    }
  }
}

// Instancia singleton
export const authService = new AuthService();

// Funciones de conveniencia para mantener compatibilidad
export const signInWithEmail = async (email, password) => {
  const result = await authService.login(email, password);
  
  if (result.success) {
    return { data: { user: result.user }, error: null };
  } else {
    return { data: null, error: { message: result.error } };
  }
};

export const signOut = async () => {
  const result = await authService.logout();
  return { error: result.success ? null : { message: 'Error al cerrar sesión' } };
};

export const getCurrentUser = async () => {
  const user = await authService.getCurrentUser();
  return user ? { data: { user }, error: null } : { data: null, error: { message: 'No authenticated' } };
};

export const registerUser = async (userData) => {
  const result = await authService.register(userData);
  
  if (result.success) {
    return { data: result.data, error: null };
  } else {
    return { data: null, error: { message: result.error } };
  }
};

export default authService;
