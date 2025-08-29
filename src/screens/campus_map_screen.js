import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { signOut } from '../../lib/auth'; // Ya no necesario
import { getBuildingData } from '../data/synthetic_data';

const { width, height } = Dimensions.get('window');

// Configuración de edificios del campus
const campusBuildingsConfig = [
  {
    id: 1,
    name: 'Edificio A - Administración',
    position: { x: 100, y: 150 },
  },
  {
    id: 2,
    name: 'Edificio B - Aulas',
    position: { x: 200, y: 100 },
  },
  {
    id: 3,
    name: 'Edificio C - Laboratorios',
    position: { x: 150, y: 250 },
  },
  {
    id: 4,
    name: 'Edificio D - Biblioteca',
    position: { x: 80, y: 300 },
  },
  {
    id: 5,
    name: 'Edificio E - Cafetería',
    position: { x: 280, y: 200 },
  },
  {
    id: 6,
    name: 'Edificio F - Gimnasio',
    position: { x: 220, y: 350 },
  },
];

const CampusMapScreen = ({ navigation }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingsData, setBuildingsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para actualizar datos de todos los edificios
  const updateBuildingsData = () => {
    const updatedBuildings = campusBuildingsConfig.map(building => {
      const data = getBuildingData(building.id);
      return {
        ...building,
        consumption: data.consumption,
        status: data.status,
        color: getStatusColor(data.status),
        realTimeData: data.realTimeData
      };
    });
    setBuildingsData(updatedBuildings);
    setLastUpdate(new Date());
  };

  // Actualizar datos cada 10 segundos
  useEffect(() => {
    updateBuildingsData();
    const interval = setInterval(updateBuildingsData, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    updateBuildingsData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBuildingPress = (building) => {
    setSelectedBuilding(building);
    navigation.navigate('BuildingDashboard', { 
      buildingId: building.id,
      buildingName: building.name,
      buildingData: building
    });
  };

  // Función para mostrar información del sistema
  const showSystemInfo = () => {
    Alert.alert(
      'Sistema de Monitoreo Energético',
      `Panel de Administración\n\nMonitoreando ${buildingsData.length} edificios\nConsumo total: ${getTotalConsumption()} kWh\nÚltima actualización: ${lastUpdate.toLocaleString()}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return '#3b82f6';
      case 'normal': return '#10b981';
      case 'high': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low': return 'Bajo';
      case 'normal': return 'Normal';
      case 'high': return 'Alto';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const getTotalConsumption = () => {
    return buildingsData.reduce((total, building) => total + building.consumption, 0).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Panel de Administración</Text>
              <Text style={styles.headerSubtitle}>
                Sistema de Monitoreo Energético
              </Text>
            </View>
            <TouchableOpacity onPress={showSystemInfo} style={styles.infoButton}>
              <Text style={styles.infoText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor={'#3b82f6'}
            />
          }
        >
        {/* Resumen del consumo */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Consumo Total del Campus</Text>
          <Text style={styles.summaryValue}>
            {getTotalConsumption()} kWh
          </Text>
          <Text style={styles.summarySubtitle}>
            {buildingsData.length} edificios monitoreados
          </Text>
        </View>

        {/* Mapa del campus */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Mapa del Campus</Text>
          <View style={styles.mapView}>
            {/* Fondo del mapa */}
            <View style={styles.mapBackground}>
              {/* Caminos */}
              <View style={styles.road1} />
              <View style={styles.road2} />
              
              {/* Área verde */}
              <View style={styles.greenArea1} />
              <View style={styles.greenArea2} />
              
              {/* Edificios */}
              {buildingsData.map((building) => (
                <TouchableOpacity
                  key={building.id}
                  style={[
                    styles.building,
                    {
                      left: building.position.x,
                      top: building.position.y,
                      backgroundColor: building.color,
                    },
                  ]}
                  onPress={() => handleBuildingPress(building)}
                >
                  <Text style={styles.buildingLabel}>
                    {building.name.charAt(9)} {/* Solo la letra del edificio */}
                  </Text>
                  <Text style={styles.buildingConsumption}>
                    {building.consumption}kWh
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Lista de edificios */}
        <View style={styles.buildingsListContainer}>
          <Text style={styles.buildingsListTitle}>Edificios del Campus</Text>
          {buildingsData.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => handleBuildingPress(building)}
            >
              <View style={styles.buildingCardContent}>
                <View style={styles.buildingCardLeft}>
                  <Text style={styles.buildingCardName}>{building.name}</Text>
                  <Text style={styles.buildingCardConsumption}>
                    {building.consumption} kWh
                  </Text>
                  <Text style={styles.buildingCardTime}>
                    Actualizado: {new Date(building.realTimeData?.timestamp || Date.now()).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.buildingCardRight}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(building.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(building.status) }
                  ]}>
                    {getStatusText(building.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e40af', // Color del header para que combine
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflowY: 'auto',
    }),
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 95px)', // Ajustar según altura del header
    }),
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  mapContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  mapView: {
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#22c55e',
    position: 'relative',
  },
  road1: {
    position: 'absolute',
    top: 0,
    left: '40%',
    width: '20%',
    height: '100%',
    backgroundColor: '#6b7280',
  },
  road2: {
    position: 'absolute',
    top: '40%',
    left: 0,
    width: '100%',
    height: '20%',
    backgroundColor: '#6b7280',
  },
  greenArea1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: '#16a34a',
    borderRadius: 30,
  },
  greenArea2: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#16a34a',
    borderRadius: 30,
  },
  building: {
    position: 'absolute',
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buildingLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buildingConsumption: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  buildingsListContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingsListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  buildingCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buildingCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingCardLeft: {
    flex: 1,
  },
  buildingCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  buildingCardConsumption: {
    fontSize: 14,
    color: '#6b7280',
  },
  buildingCardTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  buildingCardRight: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CampusMapScreen;