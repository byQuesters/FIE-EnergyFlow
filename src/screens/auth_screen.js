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
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmail, registerUser } from '../../lib/auth';

// Componente de Alerta Personalizada
const CustomAlert = ({ visible, type, title, message, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          icon: '✓',
          iconBg: '#059669',
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          icon: '✕',
          iconBg: '#dc2626',
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          icon: '⚠',
          iconBg: '#d97706',
        };
      default:
        return {
          backgroundColor: '#3b82f6',
          icon: 'ℹ',
          iconBg: '#2563eb',
        };
    }
  };

  const alertStyle = getAlertStyle();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.alertOverlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            { 
              backgroundColor: alertStyle.backgroundColor,
              opacity: fadeAnim,
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            }
          ]}
        >
          <View style={[styles.alertIconContainer, { backgroundColor: alertStyle.iconBg }]}>
            <Text style={styles.alertIcon}>{alertStyle.icon}</Text>
          </View>
          
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
          </View>

          <TouchableOpacity 
            style={styles.alertButton}
            onPress={onClose}
          >
            <Text style={styles.alertButtonText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Estado para alertas personalizadas
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message) => {
    setAlert({ visible: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, name } = formData;

    if (!email || !password) {
      showAlert('error', 'Campos incompletos', 'Por favor completa todos los campos requeridos');
      return false;
    }

    // Validación de email - debe ser @ucol.mx
    const emailRegex = /^[^\s@]+@ucol\.mx$/;
    if (!emailRegex.test(email)) {
      showAlert(
        'error',
        'Email inválido', 
        'El email debe ser de la Universidad de Colima (@ucol.mx)\nEjemplo: jaguilar51@ucol.mx'
      );
      return false;
    }

    // Validación de contraseña - mínimo 8 caracteres
    if (password.length < 8) {
      showAlert(
        'warning',
        'Contraseña débil', 
        'La contraseña debe tener al menos 8 caracteres para mayor seguridad'
      );
      return false;
    }

    // Validaciones específicas para registro
    if (!isLogin) {
      if (!name) {
        showAlert('error', 'Nombre requerido', 'Por favor ingresa tu nombre completo');
        return false;
      }

      if (password !== confirmPassword) {
        showAlert(
          'error',
          'Contraseñas no coinciden', 
          'Las contraseñas ingresadas no son iguales. Por favor verifica.'
        );
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
        // Mostrar alerta específica para credenciales incorrectas
        if (error.message.includes('Credenciales') || error.message.includes('inválidas')) {
          showAlert(
            'error',
            'Credenciales incorrectas', 
            'El email o la contraseña son incorrectos. Por favor verifica tus datos.'
          );
        } else {
          showAlert('error', 'Error de autenticación', error.message);
        }
      } else {
        console.log('Login exitoso:', data.user);
        showAlert('success', '¡Bienvenido!', 'Has iniciado sesión correctamente');
        setTimeout(() => {
          navigation.replace('CampusMap');
        }, 1500);
      }
    } catch (error) {
      console.error('Error en login:', error);
      showAlert(
        'error',
        'Error de conexión', 
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
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
        // Mostrar alertas específicas según el tipo de error
        if (error.message.includes('ya está registrado') || error.message.includes('ya existe')) {
          showAlert(
            'warning',
            'Email en uso', 
            'Este email ya está registrado. Por favor inicia sesión o usa otro email.'
          );
        } else {
          showAlert('error', 'Error de registro', error.message);
        }
      } else {
        showAlert(
          'success',
          'Registro exitoso', 
          'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.'
        );
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      showAlert(
        'error',
        'Error de conexión', 
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
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

      {/* Alerta Personalizada */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />
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
  // Estilos para Alerta Personalizada
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  alertContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 140,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AuthScreen;
