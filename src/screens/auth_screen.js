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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail, registerUser } from '../../lib/auth';
import SettingsModal from '../components/SettingsModal'; // ✅ Importación del Modal

const LogoUcol = require("../../assets/LogoUCOL.png");

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
      case 'success': return { backgroundColor: '#10b981', icon: '✓', iconBg: '#059669' };
      case 'error': return { backgroundColor: '#ef4444', icon: '✕', iconBg: '#dc2626' };
      case 'warning': return { backgroundColor: '#f59e0b', icon: '⚠', iconBg: '#d97706' };
      default: return { backgroundColor: '#3b82f6', icon: 'ℹ', iconBg: '#2563eb' };
    }
  };

  const alertStyle = getAlertStyle();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <BlurView intensity={40} tint="dark" style={styles.alertOverlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            { 
              backgroundColor: alertStyle.backgroundColor,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
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
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [loading, setLoading] = useState(false);
  
  // ✅ Estados para Política de Privacidad
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [alert, setAlert] = useState({ visible: false, type: 'info', title: '', message: '' });

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

    // ✅ Validación de Checkbox (redundante si el botón está deshabilitado, pero buena práctica)
    if (!isPolicyAccepted) {
      showAlert('warning', 'Aceptación Requerida', 'Debes leer y aceptar la Política de Privacidad y Uso.');
      return false;
    }

    const emailRegex = /^[^\s@]+@ucol\.mx$/;
    if (!emailRegex.test(email)) {
      showAlert('error', 'Email inválido', 'El correo debe ser oficial de la Universidad de Colima (@ucol.mx)');
      return false;
    }

    if (password.length < 8) {
      showAlert('warning', 'Contraseña débil', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!isLogin) {
      if (!name) {
        showAlert('error', 'Nombre requerido', 'Por favor ingresa tu nombre completo');
        return false;
      }
      if (password !== confirmPassword) {
        showAlert('error', 'Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales.');
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
        if (error.message.includes('Credenciales') || error.message.includes('inválidas')) {
          showAlert('error', 'Credenciales incorrectas', 'El email o la contraseña son incorrectos.');
        } else {
          showAlert('error', 'Error de autenticación', error.message);
        }
      } else {
        console.log('Login exitoso:', data.user);
        showAlert('success', '¡Bienvenido!', 'Has iniciado sesión correctamente');
        setTimeout(() => {
          navigation.replace('EF - Mapa del Campus');
        }, 1500);
      }
    } catch (error) {
      console.error('Error en login:', error);
      showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
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
        if (error.message.includes('registrado') || error.message.includes('existe')) {
          showAlert('warning', 'Correo en uso', 'Este correo ya está registrado.');
        } else {
          showAlert('error', 'Error de registro', error.message);
        }
      } else {
        showAlert('success', 'Registro exitoso', 'Tu cuenta ha sido creada. Inicia sesión.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setIsPolicyAccepted(false); // Resetear check
  };

  return (
    <View style={styles.safeArea}>
      <LinearGradient colors={['#f5f5f5ff', '#f5f5f5ff', '#f5f5f5ff']} style={styles.gradient}>
        
        {/* ✅ Modal de Políticas */}
        <SettingsModal 
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          systemInfo={null}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image source={LogoUcol} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.subtitle}>Sistema de Monitoreo Energético de la FIE</Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.tabsContainer}>
                  <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.tab, isLogin && styles.tabActive]}>
                    <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Iniciar Sesión</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.tab, !isLogin && styles.tabActive]}>
                    <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Registrarse</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
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

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ejemplo@ucol.mx"
                      placeholderTextColor="#94a3b8"
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

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
                    {isLogin && (
                      <TouchableOpacity onPress={() => navigation.navigate('EF - Recuperar Contraseña')} style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                      </TouchableOpacity>
                    )}
                  </View>

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

                  {/* ✅ CHECKBOX Y POLÍTICA DE PRIVACIDAD */}
                  <View style={styles.policyContainer}>
                    <TouchableOpacity 
                      style={styles.checkbox} 
                      onPress={() => setIsPolicyAccepted(!isPolicyAccepted)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isPolicyAccepted ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={isPolicyAccepted ? "#93ab6b" : "#9ca3af"} 
                      />
                    </TouchableOpacity>
                    
                    <View style={styles.policyTextContainer}>
                      <Text style={styles.policyTextNormal}>He leído y acepto la </Text>
                      <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                        <Text style={styles.policyLink}>Política de Privacidad y Uso</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ✅ BOTÓN DESACTIVADO SI NO SE ACEPTA LA POLÍTICA */}
                  <TouchableOpacity
                    onPress={isLogin ? handleLogin : handleRegister}
                    disabled={loading || !isPolicyAccepted}
                    style={[styles.button, (loading || !isPolicyAccepted) && styles.buttonDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>{isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}</Text>
                    <TouchableOpacity onPress={toggleMode}>
                      <Text style={styles.footerLink}>{isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.footer}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>© Derechos Reservados 2025</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <CustomAlert visible={alert.visible} type={alert.type} title={alert.title} message={alert.message} onClose={closeAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { width: 120, height: 120, backgroundColor: '#f5f5f5ff', borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 8 },
  logo: { width: '250%' },
  subtitle: { fontSize: 15, color: '#000000b3', textAlign: 'center', paddingHorizontal: 20, marginTop: 0, fontWeight: 'bold' },
  formCard: { width: '100%', maxWidth: 450, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  tabsContainer: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#e8f0e0', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: '#93ab6b', shadowOpacity: 0.1, elevation: 2 },
  tabText: { fontWeight: '600', fontSize: 15, color: '#6b8e4a' },
  tabTextActive: { color: 'white', fontWeight: 'bold' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 16 },
  label: { marginLeft: 4, fontSize: 16, fontWeight: '600', color: '#000000bd', marginBottom: 8 },
  input: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, fontSize: 16, color: '#1f2937', borderWidth: 1, borderColor: '#d1d5db' },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 8 },
  forgotPasswordText: { color: '#93ab6b', fontSize: 13, fontWeight: '600' },
  
  // Estilos Checkbox corregidos (Centrado vertical)
  policyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 20, paddingHorizontal: 4 },
  checkbox: { marginRight: 10 },
  policyTextContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  policyTextNormal: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  policyLink: { fontSize: 13, color: '#93ab6b', fontWeight: 'bold', textDecorationLine: 'underline', lineHeight: 20 },

  button: { backgroundColor: '#93ab6b', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 8, elevation: 5 },
  buttonDisabled: { backgroundColor: '#a8c48e', opacity: 0.6, elevation: 0 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { color: '#6b7280', marginBottom: 8, fontSize: 14 },
  footerLink: { color: '#93ab6b', fontWeight: 'bold', fontSize: 15 },
  
  alertOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertContainer: { width: '100%', maxWidth: 350, borderRadius: 20, padding: 24, alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: 'rgba(0, 0, 0, 1)' },
  alertIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  alertIcon: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  alertContent: { alignItems: 'center', marginBottom: 24 },
  alertTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' },
  alertMessage: { fontSize: 16, color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center', lineHeight: 22 },
  alertButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 25, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', minWidth: 140 },
  alertButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});

export default AuthScreen;