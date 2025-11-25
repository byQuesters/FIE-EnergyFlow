// src/screens/password_recovery_screen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { BlurView } from 'expo-blur';

// Detectar URL base
const getApiBaseUrl = () => {
  // Usar variable de entorno si está disponible (mismo comportamiento que en lib/auth.js)
  const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (EXPO_PUBLIC_API_URL) {
    return EXPO_PUBLIC_API_URL;
  }

  if (NEXT_PUBLIC_API_URL) {
    return NEXT_PUBLIC_API_URL;
  }

  // En producción (Vercel), usar la URL del dominio actual solo si window.location existe
  if (
    typeof window !== 'undefined' &&
    window.location &&
    typeof window.location.hostname === 'string' &&
    window.location.hostname !== 'localhost'
  ) {
    return window.location.origin;
  }

  // Fallback por defecto (producción pública)
  return 'https://fie-energy-flow.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

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
    }
  }, [visible]);

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', icon: '✓', iconBg: '#059669' };
      case 'error':
        return { backgroundColor: '#ef4444', icon: '✕', iconBg: '#dc2626' };
      case 'warning':
        return { backgroundColor: '#f59e0b', icon: '⚠', iconBg: '#d97706' };
      default:
        return { backgroundColor: '#3b82f6', icon: 'ℹ', iconBg: '#2563eb' };
    }
  };

  const alertStyle = getAlertStyle();
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <BlurView intensity={40} // Ajusta qué tan borroso se ve (0 a 100)
        tint="dark"    // Puede ser 'light', 'dark', 'default'
        style={styles.alertOverlay}
      >        <Animated.View 
          style={[
            styles.alertContainer,
            { backgroundColor: alertStyle.backgroundColor, opacity: fadeAnim }
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

const PasswordRecoveryScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: email, 2: código y nueva contraseña
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Paso 1: Enviar código de recuperación
  const handleSendCode = async () => {
    if (!email) {
      showAlert('error', 'Campo vacío', 'Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@ucol\.mx$/;
    if (!emailRegex.test(email)) {
      showAlert('error', 'Email inválido', 'El correo debe ser oficial de la Universidad de Colima (@ucol.mx)');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', '¡Código enviado!', 'Revisa tu correo electrónico para obtener el código de verificación');
        setTimeout(() => {
          setStep(2);
          closeAlert();
        }, 2000);
      } else {
        showAlert('error', 'Error', data.message || 'No se pudo enviar el código');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código y restablecer contraseña
  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      showAlert('error', 'Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 8) {
      showAlert('warning', 'Contraseña débil', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', '¡Contraseña actualizada!', 'Tu contraseña ha sido restablecida exitosamente');
        setTimeout(() => {
          navigation.navigate('EF - Autenticación');
        }, 2000);
      } else {
        showAlert('error', 'Error', data.message || 'No se pudo restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <LinearGradient colors={['#f5f5f5ff', '#f5f5f5ff', '#f5f5f5ff']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>🔑</Text>
                </View>
                <Text style={styles.title}>Recuperar Contraseña</Text>
                <Text style={styles.subtitle}>
                  {step === 1 
                    ? 'Ingresa tu email para recibir un código de verificación'
                    : 'Ingresa el código y tu nueva contraseña'}
                </Text>
              </View>

              {/* Formulario */}
              <View style={styles.formCard}>
                {/* Indicador de pasos */}
                <View style={styles.stepsIndicator}>
                  <View style={styles.stepContainer}>
                    <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                      <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
                    </View>
                    <Text style={styles.stepLabel}>Email</Text>
                  </View>
                  
                  <View style={styles.stepLine} />
                  
                  <View style={styles.stepContainer}>
                    <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                      <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
                    </View>
                    <Text style={styles.stepLabel}>Código</Text>
                  </View>
                </View>

                {/* Paso 1: Email */}
                {step === 1 && (
                  <View style={styles.form}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email institucional</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="ejemplo@ucol.mx"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleSendCode}
                      disabled={loading}
                      style={[styles.button, loading && styles.buttonDisabled]}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Enviar Código</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Paso 2: Código y nueva contraseña */}
                {step === 2 && (
                  <View style={styles.form}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Código de verificación</Text>
                      <TextInput
                        style={[styles.input, styles.codeInput]}
                        placeholder="123456"
                        placeholderTextColor="#94a3b8"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <Text style={styles.hint}>Revisa tu correo institucional</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Nueva contraseña</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Mínimo 8 caracteres"
                        placeholderTextColor="#94a3b8"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Confirmar contraseña</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor="#94a3b8"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleResetPassword}
                      disabled={loading}
                      style={[styles.button, loading && styles.buttonDisabled]}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Restablecer Contraseña</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.secondaryButtonText}>Reenviar código</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Volver al login */}
                <View style={styles.footer}>
                  <TouchableOpacity onPress={() => navigation.navigate('EF - Autenticación')}>
                    <Text style={styles.footerLink}>← Volver al inicio de sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: { fontSize: 40 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
  formCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#93ab6b',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
    marginBottom: 28,
  },
  form: { width: '100%' },
  inputContainer: { marginBottom: 16 },
  label: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000bd',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#93ab6b',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a8c48e',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#93ab6b',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerLink: {
    color: '#93ab6b',
    fontWeight: 'bold',
    fontSize: 15,
  },
// Estilos para Alerta Personalizada
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', <--- ESTO SE ELIMINA O COMENTA
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
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 1)',

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

export default PasswordRecoveryScreen;
