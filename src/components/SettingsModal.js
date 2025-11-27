import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Habilitar animaciones para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const SettingsModal = ({ visible, onClose, systemInfo }) => {
  const { theme, toggleTheme, themeType } = useTheme();
  const { colors } = theme;
  
  // Estado para expandir/colapsar políticas
  const [showPrivacy, setShowPrivacy] = useState(false);

  const togglePrivacy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPrivacy(!showPrivacy);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, maxHeight: height * 0.85 }]}>
              
              {/* Header del Modal */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Selector de Tema */}
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Ionicons 
                      name={themeType === 'dark' ? "moon" : "sunny"} 
                      size={22} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.label, { color: colors.text }]}>Modo Oscuro</Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor={themeType === 'dark' ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleTheme}
                    value={themeType === 'dark'}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Información del Sistema */}
                <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Información del Sistema</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Energy Flow Monitor
                  </Text>
                  {systemInfo && (
                    <>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        • {systemInfo.buildingCount} edificios conectados
                      </Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        • Consumo Global: {systemInfo.totalConsumption} kWh
                      </Text>
                      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Última sincronización: {systemInfo.lastUpdate}
                      </Text>
                    </>
                  )}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Sección de Privacidad Desplegable - EXTENDIDA Y PROFESIONAL */}
                <TouchableOpacity 
                  style={[styles.privacyHeader, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]} 
                  onPress={togglePrivacy}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                    <Text style={[styles.label, { color: colors.text, fontSize: 14 }]}>Aviso Legal y Privacidad</Text>
                  </View>
                  <Ionicons 
                    name={showPrivacy ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>

                {showPrivacy && (
                  <View style={styles.privacyContent}>
                    <Text style={[styles.policyTitle, { color: colors.text }]}>
                      TÉRMINOS DE USO - UCOL 2025
                    </Text>
                    
                    <Text style={[styles.policySubtitle, { color: colors.text }]}>1. DISPOSICIONES GENERALES</Text>
                    <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                      El presente sistema de monitoreo energético, "Energy Flow Monitor", es una herramienta tecnológica propiedad de la <Text style={{ fontWeight: 'bold' }}>Universidad de Colima</Text>. Su acceso está estrictamente limitado a personal autorizado, estudiantes e investigadores con credenciales institucionales vigentes. El uso de esta plataforma implica la aceptación total e incondicional de estos términos.
                    </Text>

                    <Text style={[styles.policySubtitle, { color: colors.text }]}>2. TRATAMIENTO DE DATOS</Text>
                    <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                      El sistema recopila, almacena y procesa datos telemétricos en tiempo real (voltaje, corriente, potencia y consumo energético) provenientes de la infraestructura universitaria. Estos datos son clasificados como información técnica institucional y no contienen datos personales sensibles de los usuarios, garantizando el cumplimiento de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
                    </Text>

                    <Text style={[styles.policySubtitle, { color: colors.text }]}>3. RESPONSABILIDAD DEL USUARIO</Text>
                    <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                      El usuario se compromete a utilizar la información visualizada exclusivamente para fines académicos, administrativos o de investigación. Queda prohibida la difusión, alteración o comercialización de los reportes generados sin autorización expresa de la Dirección General de Recursos Materiales o la dependencia correspondiente.
                    </Text>

                    <Text style={[styles.policySubtitle, { color: colors.text }]}>4. PROPIEDAD INTELECTUAL Y DERECHOS DE AUTOR</Text>
                    <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                      El código fuente, diseño de interfaz, algoritmos de predicción (ML) y la arquitectura lógica de esta aplicación están protegidos por las leyes nacionales e internacionales de derechos de autor.
                      {'\n\n'}
                      <Text style={{ fontWeight: 'bold' }}>CRÉDITOS DE DESARROLLO:</Text>
                      {'\n'}Esta solución fue diseñada y programada por el equipo de desarrollo de software de la Facultad de Ingeniería Electromecánica (FIE). Todos los derechos patrimoniales sobre el software pertenecen a la Universidad de Colima, mientras que el reconocimiento moral corresponde a los programadores autores del sistema.
                    </Text>

                    <Text style={[styles.policySubtitle, { color: colors.text }]}>5. ACTUALIZACIONES Y VIGENCIA</Text>
                    <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                      Estos términos pueden ser modificados en cualquier momento para adaptarse a nuevas normativas o funcionalidades del sistema. Última actualización: 2025.
                    </Text>

                    <View style={styles.copyrightContainer}>
                      <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
                        © 2025 Universidad de Colima. Todos los derechos reservados.
                      </Text>
                    </View>
                  </View>
                )}

              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.90,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 10,
    opacity: 0.7,
  },
  
  // Estilos Privacidad Mejorados
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  privacyContent: {
    padding: 10,
    marginTop: 5,
    backgroundColor: 'transparent',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  policySubtitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 15,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  policyText: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 18,
    textAlign: 'justify',
  },
  copyrightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  copyrightText: {
    fontSize: 10,
    marginLeft: 6,
    textAlign: 'center',
    lineHeight: 14,
  }
});

export default SettingsModal;