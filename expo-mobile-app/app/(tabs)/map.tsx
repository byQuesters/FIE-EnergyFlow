import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Surface,
  Button,
  Modal,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;

interface Building {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  status: 'active' | 'inactive' | 'maintenance';
  currentPower: number;
  totalEnergy: number;
}

const buildings: Building[] = [
  {
    id: '1',
    name: 'Edificio Principal',
    description: 'Rectoría y oficinas administrativas',
    x: 0.3,
    y: 0.4,
    status: 'active',
    currentPower: 2500,
    totalEnergy: 1250.5,
  },
  {
    id: '2',
    name: 'Laboratorio de Ingeniería',
    description: 'LIOT - Laboratorio de IoT y Sistemas Embebidos',
    x: 0.6,
    y: 0.3,
    status: 'active',
    currentPower: 1800,
    totalEnergy: 890.2,
  },
  {
    id: '3',
    name: 'Biblioteca Central',
    description: 'Centro de información y recursos académicos',
    x: 0.2,
    y: 0.6,
    status: 'active',
    currentPower: 950,
    totalEnergy: 445.8,
  },
  {
    id: '4',
    name: 'Centro de Cómputo',
    description: 'Aulas de cómputo y servidores',
    x: 0.7,
    y: 0.5,
    status: 'maintenance',
    currentPower: 0,
    totalEnergy: 0,
  },
  {
    id: '5',
    name: 'Auditorio',
    description: 'Eventos y conferencias académicas',
    x: 0.4,
    y: 0.7,
    status: 'inactive',
    currentPower: 150,
    totalEnergy: 25.5,
  },
];

export default function MapScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getStatusColor = (status: Building['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'maintenance':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: Building['status']) => {
    switch (status) {
      case 'active':
        return 'check-circle';
      case 'inactive':
        return 'pause-circle';
      case 'maintenance':
        return 'build-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: Building['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return 'Desconocido';
    }
  };

  const handleBuildingPress = (building: Building) => {
    setSelectedBuilding(building);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBuilding(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Estadísticas Generales */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statsTitle}>
              Resumen General del Campus
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialIcons name="business" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.statLabel}>Edificios</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {buildings.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.statLabel}>Activos</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {buildings.filter(b => b.status === 'active').length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="flash-on" size={24} color="#2196F3" />
                <Text variant="bodySmall" style={styles.statLabel}>Potencia</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {buildings.reduce((sum, b) => sum + b.currentPower, 0).toFixed(0)}W
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="battery-charging-full" size={24} color="#FF9800" />
                <Text variant="bodySmall" style={styles.statLabel}>Energía</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {buildings.reduce((sum, b) => sum + b.totalEnergy, 0).toFixed(1)}kWh
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Mapa del Campus */}
        <Card style={styles.mapCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.mapTitle}>
              Mapa del Campus - UCOL
            </Text>
            <Surface style={styles.mapContainer}>
              <Image
                source={require('../../assets/campus-map.png')}
                style={styles.mapImage}
                resizeMode="cover"
              />
              
              {/* Marcadores de edificios */}
              {buildings.map((building) => (
                <Pressable
                  key={building.id}
                  style={[
                    styles.buildingMarker,
                    {
                      left: building.x * (screenWidth - 80),
                      top: building.y * 200,
                      backgroundColor: getStatusColor(building.status),
                    },
                  ]}
                  onPress={() => handleBuildingPress(building)}
                >
                  <MaterialIcons 
                    name="business" 
                    size={16} 
                    color="#fff" 
                  />
                </Pressable>
              ))}
            </Surface>
            
            <Text variant="bodySmall" style={styles.mapHint}>
              Toca los marcadores para ver detalles de cada edificio
            </Text>
          </Card.Content>
        </Card>

        {/* Lista de Edificios */}
        <Card style={styles.buildingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.buildingsTitle}>
              Lista de Edificios
            </Text>
            <View style={styles.buildingsList}>
              {buildings.map((building) => (
                <Surface
                  key={building.id}
                  style={styles.buildingItem}
                  elevation={2}
                >
                  <Pressable
                    style={styles.buildingItemPressable}
                    onPress={() => handleBuildingPress(building)}
                  >
                    <View style={styles.buildingItemHeader}>
                      <View style={styles.buildingItemInfo}>
                        <Text variant="titleMedium" style={styles.buildingName}>
                          {building.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.buildingDescription}>
                          {building.description}
                        </Text>
                      </View>
                      <View style={styles.buildingStatus}>
                        <MaterialIcons
                          name={getStatusIcon(building.status)}
                          size={24}
                          color={getStatusColor(building.status)}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.buildingMetrics}>
                      <View style={styles.metric}>
                        <Text variant="bodySmall" style={styles.metricLabel}>Potencia</Text>
                        <Text variant="bodyMedium" style={styles.metricValue}>
                          {building.currentPower}W
                        </Text>
                      </View>
                      <View style={styles.metric}>
                        <Text variant="bodySmall" style={styles.metricLabel}>Energía</Text>
                        <Text variant="bodyMedium" style={styles.metricValue}>
                          {building.totalEnergy}kWh
                        </Text>
                      </View>
                      <View style={styles.metric}>
                        <Text variant="bodySmall" style={styles.metricLabel}>Estado</Text>
                        <Text 
                          variant="bodyMedium" 
                          style={[styles.metricValue, { color: getStatusColor(building.status) }]}
                        >
                          {getStatusText(building.status)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Detalles del Edificio */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          {selectedBuilding && (
            <Card>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <MaterialIcons
                    name={getStatusIcon(selectedBuilding.status)}
                    size={32}
                    color={getStatusColor(selectedBuilding.status)}
                  />
                  <View style={styles.modalTitleContainer}>
                    <Text variant="titleLarge" style={styles.modalTitle}>
                      {selectedBuilding.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.modalSubtitle}>
                      {selectedBuilding.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalMetrics}>
                  <Surface style={styles.modalMetricCard}>
                    <MaterialIcons name="flash-on" size={24} color="#2196F3" />
                    <Text variant="bodySmall" style={styles.modalMetricLabel}>
                      Potencia Actual
                    </Text>
                    <Text variant="titleMedium" style={styles.modalMetricValue}>
                      {selectedBuilding.currentPower} W
                    </Text>
                  </Surface>

                  <Surface style={styles.modalMetricCard}>
                    <MaterialIcons name="battery-charging-full" size={24} color="#4CAF50" />
                    <Text variant="bodySmall" style={styles.modalMetricLabel}>
                      Energía Total
                    </Text>
                    <Text variant="titleMedium" style={styles.modalMetricValue}>
                      {selectedBuilding.totalEnergy} kWh
                    </Text>
                  </Surface>
                </View>

                <View style={styles.modalStatus}>
                  <Text variant="bodyMedium" style={styles.modalStatusLabel}>
                    Estado del Edificio:
                  </Text>
                  <Surface style={[
                    styles.modalStatusChip,
                    { backgroundColor: getStatusColor(selectedBuilding.status) }
                  ]}>
                    <Text variant="bodyMedium" style={styles.modalStatusText}>
                      {getStatusText(selectedBuilding.status)}
                    </Text>
                  </Surface>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={closeModal}
                    style={styles.modalButton}
                  >
                    Cerrar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      closeModal();
                      // Aquí podrías navegar a una pantalla de detalles específica
                    }}
                    style={styles.modalButton}
                  >
                    Ver Detalles
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '20%',
    marginBottom: 8,
  },
  statLabel: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  statValue: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  mapCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  mapTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  mapContainer: {
    position: 'relative',
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  buildingMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapHint: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  buildingsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buildingsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  buildingsList: {
    gap: 12,
  },
  buildingItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buildingItemPressable: {
    padding: 16,
  },
  buildingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buildingItemInfo: {
    flex: 1,
  },
  buildingName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  buildingDescription: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  buildingStatus: {
    marginLeft: 12,
  },
  buildingMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  metricValue: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  modalMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalMetricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  modalMetricLabel: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  modalMetricValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalStatusLabel: {
    color: theme.colors.onSurface,
  },
  modalStatusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalStatusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    minWidth: 80,
  },
});