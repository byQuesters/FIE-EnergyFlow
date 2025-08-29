import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Para desarrollo web, usar valores directos
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://lpjxsvasvbpwazwobcnp.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwanhzdmFzdmJwd2F6d29iY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNjA2MDEsImV4cCI6MjA1MDczNjYwMX0.rS8tHUd5S_LNjb_gVj8k4nGBJLT7NXdSNEtB5SxE1XA';

console.log('Supabase Config:', { url: supabaseUrl ? 'loaded' : 'missing', key: supabaseAnonKey ? 'loaded' : 'missing' });

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Función para iniciar sesión con email y contraseña
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    return { data, error };
  } catch (error) {
    console.error('Error en signInWithEmail:', error);
    return { 
      data: null, 
      error: { message: 'Error de conexión. Verifica tu internet.' } 
    };
  }
};

// Función para registrar un nuevo usuario
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    return { data, error };
  } catch (error) {
    console.error('Error en signUpWithEmail:', error);
    return { 
      data: null, 
      error: { message: 'Error de conexión. Verifica tu internet.' } 
    };
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error en signOut:', error);
    return { error: { message: 'Error al cerrar sesión' } };
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Función para escuchar cambios en la autenticación
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
