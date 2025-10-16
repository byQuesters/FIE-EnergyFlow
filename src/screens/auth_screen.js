import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmail, registerUser } from '../../lib/auth';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, name } = formData;

    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return false;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    // Validación de contraseña
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validaciones específicas para registro
    if (!isLogin) {
      if (!name) {
        Alert.alert('Error', 'Por favor ingresa tu nombre');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { data, error } = await signInWithEmail(formData.email, formData.password);
      
      if (error) {
        Alert.alert('Error de autenticación', error.message);
      } else {
        console.log('Login exitoso:', data.user);
        navigation.replace('CampusMap');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { data, error } = await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      
      if (error) {
        Alert.alert('Error de registro', error.message);
      } else {
        Alert.alert(
          'Registro exitoso', 
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsLogin(true);
                setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Logo y título */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>⚡</Text>
                </View>
                <Text style={styles.title}>Energy Monitor</Text>
                <Text style={styles.subtitle}>Sistema de Monitoreo Energético</Text>
              </View>

              {/* Tabs Login/Register */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  onPress={() => setIsLogin(true)}
                  style={[styles.tab, isLogin && styles.tabActive]}
                >
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsLogin(false)}
                  style={[styles.tab, !isLogin && styles.tabActive]}
                >
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              <View style={styles.form}>
                {/* Campo Nombre (solo en registro) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre completo</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu nombre"
                      placeholderTextColor="#94a3b8"
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Campo Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#94a3b8"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Campo Contraseña */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu contraseña"
                    placeholderTextColor="#94a3b8"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {/* Campo Confirmar Contraseña (solo en registro) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirma tu contraseña"
                      placeholderTextColor="#94a3b8"
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Botón de Acción */}
                <TouchableOpacity
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Link para cambiar de modo */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.footerLink}>
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#d97706',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  footerLink: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
