import { config } from './config';

// URL base de tu API de Next.js
const API_BASE_URL = 'http://localhost:3000'; // Cambia esto por la URL de tu servidor Next.js

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
          
          // Guardar datos del usuario en localStorage para persistencia
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('isAuthenticated', 'true');
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
        
        // Guardar datos del usuario en localStorage para persistencia
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
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
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
    
    return { success: true };
  }

  getCurrentUser() {
    if (this.user) {
      return this.user;
    }

    // Intentar recuperar usuario de localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = true;
        return this.user;
      }
    }

    return null;
  }

  isUserAuthenticated() {
    if (this.isAuthenticated) {
      return true;
    }

    // Verificar localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAuthenticated') === 'true';
    }

    return false;
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

export const getCurrentUser = () => {
  const user = authService.getCurrentUser();
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
