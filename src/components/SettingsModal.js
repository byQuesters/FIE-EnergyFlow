// src/components/SettingsModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SettingsModal = ({ visible, onClose, systemInfo }) => {
  const { theme, toggleTheme, themeType } = useTheme();
  const { colors } = theme;

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
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              
              {/* Header del Modal */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

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

              {/* Información del Sistema (Heredada) */}
              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Acerca de la App</Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Sistema de Monitoreo Energético
                </Text>
                {systemInfo && (
                  <>
                     <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {systemInfo.buildingCount} edificios monitoreados
                    </Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      Consumo Total: {systemInfo.totalConsumption} kWh
                    </Text>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                      Actualizado: {systemInfo.lastUpdate}
                    </Text>
                  </>
                )}
              </View>

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
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
    gap: 10,
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 3,
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
  }
});

export default SettingsModal;