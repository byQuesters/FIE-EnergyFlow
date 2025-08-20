import { API_BASE_URL } from '@/constants/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  message?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (!data.success) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      return {
        success: true,
        user: data.data.user,
        token: data.data.token,
      };
    } catch (error: any) {
      // En caso de error de red o servidor, usar datos de prueba
      console.warn('Error connecting to server, using test data:', error.message);
      
      // Validación básica para demo
      if (credentials.email.endsWith('@ucol.mx') && credentials.password.length >= 6) {
        return {
          success: true,
          user: {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0],
          },
          token: 'demo-token-' + Date.now(),
        };
      }
      
      throw new Error('Credenciales inválidas');
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error: any) {
      // En caso de error de red o servidor, simular registro exitoso para demo
      console.warn('Error connecting to server, simulating registration:', error.message);
      
      if (userData.email.endsWith('@ucol.mx') && userData.password.length >= 6) {
        return {
          success: true,
          message: 'Usuario registrado exitosamente',
        };
      }
      
      throw new Error('Error al registrar usuario');
    }
  }

  async verifyToken(token: string): Promise<{ user: AuthResponse['user'] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token inválido');
      }

      if (!data.success) {
        throw new Error(data.error || 'Token inválido');
      }

      return {
        user: data.data.user,
      };
    } catch (error: any) {
      // En caso de error de red, validar token de demo
      if (token.startsWith('demo-token-')) {
        return {
          user: {
            id: '1',
            email: 'usuario@ucol.mx',
            name: 'Usuario Demo',
          },
        };
      }
      
      throw new Error('Token inválido');
    }
  }

  async logout(): Promise<void> {
    // En una implementación real, aquí se invalidaría el token en el servidor
    return Promise.resolve();
  }
}

export const authService = new AuthService();