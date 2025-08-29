import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getBuildingData } from '../data/synthetic_data';

const { width } = Dimensions.get('window');

const BuildingDashboard = ({ route, navigation }) => {
  const { buildingId, buildingName, buildingData } = route.params;
  const [activeTab, setActiveTab] = useState('realtime');
  const [currentData, setCurrentData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Actualizar datos cada 5 segundos para simular tiempo real
  useEffect(() => {
    const updateData = () => {
      const newData = getBuildingData(buildingId);
      setCurrentData(newData);
    };

    updateData();
    const interval = setInterval(updateData, 5000);

    return () => clearInterval(interval);
  }, [buildingId]);

  const refreshData = () => {
    setRefreshing(true);
    const newData = getBuildingData(buildingId);
    setCurrentData(newData);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!currentData) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6'
    }
  };

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return ['#3b82f6', '#1e40af'];
      case 'normal': return ['#10b981', '#047857'];
      case 'high': return ['#f59e0b', '#d97706'];
      case 'critical': return ['#ef4444', '#dc2626'];
      default: return ['#6b7280', '#4b5563'];
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

  const renderRealTimeData = () => (
    <View style={styles.tabContent}>
      {/* Resumen principal */}
      <View style={styles.summaryCards}>
        <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Consumo Total</Text>
          <Text style={styles.summaryCardValue}>{currentData.consumption} kWh</Text>
        </LinearGradient>
        
        <LinearGradient colors={getStatusColor(currentData.status)} style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Estado</Text>
          <Text style={styles.summaryCardValue}>
            {getStatusText(currentData.status)}
          </Text>
        </LinearGradient>
      </View>

      {/* Botón de actualización */}
      <TouchableOpacity
        style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
        onPress={refreshData}
        disabled={refreshing}
      >
        <Text style={styles.refreshButtonText}>
          {refreshing ? 'Actualizando...' : '🔄 Actualizar Datos'}
        </Text>
      </TouchableOpacity>

      {/* Datos de voltaje */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Voltajes RMS (V)</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS A</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSA}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS B</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSB}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS C</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSC}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS AB</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSAB}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS BC</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSBC}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>V RMS CA</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.V_RMSCA}</Text>
          </View>
        </View>
      </View>

      {/* Datos de corriente */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Corrientes RMS (A)</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>I RMS A</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.I_RMSA}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>I RMS B</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.I_RMSB}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>I RMS C</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.I_RMSC}</Text>
          </View>
        </View>
      </View>

      {/* Datos de potencia */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Potencia Promedio (kW)</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>P PROM A</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.PPROM_A}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>P PROM B</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.PPROM_B}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>P PROM C</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.PPROM_C}</Text>
          </View>
        </View>
      </View>

      {/* Datos de energía */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Energía (kWh)</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>kWh A</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.kWhA}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>kWh B</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.kWhB}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>kWh C</Text>
            <Text style={styles.dataValue}>{currentData.realTimeData.kWhC}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHistoricalData = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Consumo por Hora (kWh)</Text>
        <LineChart
          data={currentData.chartData.hourly}
          width={width - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Distribución por Fase (%)</Text>
        <BarChart
          data={currentData.chartData.phases}
          width={width - 60}
          height={220}
          chartConfig={barChartConfig}
          style={styles.chart}
        />
      </View>

      {/* Información adicional */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Resumen del Día</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Consumo Máximo</Text>
            <Text style={styles.summaryItemValue}>
              {Math.max(
                currentData.realTimeData.kWhA,
                currentData.realTimeData.kWhB,
                currentData.realTimeData.kWhC
              ).toFixed(1)} kWh
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Consumo Mínimo</Text>
            <Text style={styles.summaryItemValue}>
              {Math.min(
                currentData.realTimeData.kWhA,
                currentData.realTimeData.kWhB,
                currentData.realTimeData.kWhC
              ).toFixed(1)} kWh
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Promedio</Text>
            <Text style={styles.summaryItemValue}>
              {((currentData.realTimeData.kWhA + 
                 currentData.realTimeData.kWhB + 
                 currentData.realTimeData.kWhC) / 3).toFixed(1)} kWh
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Eficiencia</Text>
            <Text style={styles.summaryItemValue}>
              {currentData.status === 'low' ? '95%' :
               currentData.status === 'normal' ? '88%' :
               currentData.status === 'high' ? '75%' : '62%'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header con información del edificio */}
        <LinearGradient colors={['#93ab6bff', '#93ab6bff']} style={styles.header}>
          <Text style={styles.headerTitle}>{buildingName}</Text>
          <Text style={styles.headerSubtitle}>
            Última actualización: {new Date(currentData.realTimeData.timestamp).toLocaleTimeString()}
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'realtime' && styles.activeTab]}
            onPress={() => setActiveTab('realtime')}
          >
            <Text style={[styles.tabText, activeTab === 'realtime' && styles.activeTabText]}>
              Tiempo Real
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'historical' && styles.activeTab]}
            onPress={() => setActiveTab('historical')}
          >
            <Text style={[styles.tabText, activeTab === 'historical' && styles.activeTabText]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <ScrollView style={styles.content}>
          {activeTab === 'realtime' ? renderRealTimeData() : renderHistoricalData()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#93ab6bff', // Color del header para que combine
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflowY: 'auto',
    }),
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#93ab6bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 140px)', // Ajustar según altura del header y tabs
    }),
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    backgroundColor: '#abd16dff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.7,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#93ab6bff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default BuildingDashboard;
