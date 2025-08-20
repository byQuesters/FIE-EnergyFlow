import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Surface,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { RootState, AppDispatch } from '@/store';
import { fetchEnergyData } from '@/store/slices/energySlice';
import { theme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { realTimeData, historicalData, isLoading, error, isConnected } = useSelector(
    (state: RootState) => state.energy
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchEnergyData());
    
    // Actualizar datos cada 20 segundos
    const interval = setInterval(() => {
      dispatch(fetchEnergyData());
    }, 20000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchEnergyData());
    setRefreshing(false);
  };

  // Calcular totales
  const totalPower = Math.abs(realTimeData.PPROM_A || 0) + 
                    Math.abs(realTimeData.PPROM_B || 0) + 
                    Math.abs(realTimeData.PPROM_C || 0);
  const totalEnergy = (realTimeData.kWhA || 0) + 
                     (realTimeData.kWhB || 0) + 
                     (realTimeData.kWhC || 0);
  const avgVoltage = ((realTimeData.V_RMSA || 0) + 
                     (realTimeData.V_RMSB || 0) + 
                     (realTimeData.V_RMSC || 0)) / 3;
  const avgCurrent = ((realTimeData.I_RMSA || 0) + 
                     (realTimeData.I_RMSB || 0) + 
                     (realTimeData.I_RMSC || 0)) / 3;

  // Datos para gráficas
  const powerData = {
    labels: ['Fase A', 'Fase B', 'Fase C'],
    datasets: [{
      data: [
        Math.abs(realTimeData.PPROM_A || 0),
        Math.abs(realTimeData.PPROM_B || 0),
        Math.abs(realTimeData.PPROM_C || 0)
      ]
    }]
  };

  const energyData = {
    labels: ['Fase A', 'Fase B', 'Fase C'],
    datasets: [{
      data: [
        realTimeData.kWhA || 0,
        realTimeData.kWhB || 0,
        realTimeData.kWhC || 0
      ]
    }]
  };

  const voltageData = {
    labels: ['AB', 'BC', 'CA'],
    datasets: [{
      data: [
        realTimeData.V_RMSAB || 0,
        realTimeData.V_RMSBC || 0,
        realTimeData.V_RMSCA || 0
      ]
    }]
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(123, 143, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  if (isLoading && !realTimeData.timestamp) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Cargando datos energéticos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Header */}
        <Surface style={styles.statusHeader}>
          <View style={styles.statusRow}>
            <View style={styles.connectionStatus}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
              ]} />
              <Text variant="bodyMedium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>
            <Chip icon="update" mode="outlined">
              {realTimeData.timestamp ? 
                new Date(realTimeData.timestamp).toLocaleTimeString() : 
                'Sin datos'
              }
            </Chip>
          </View>
        </Surface>

        {/* Métricas principales */}
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, { backgroundColor: '#2196F3' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="flash-on" size={24} color="#fff" />
              <Text variant="bodySmall" style={styles.metricLabel}>
                Potencia Total
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                {totalPower.toFixed(1)} W
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: '#4CAF50' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="battery-charging-full" size={24} color="#fff" />
              <Text variant="bodySmall" style={styles.metricLabel}>
                Energía Total
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                {totalEnergy.toFixed(1)} kWh
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: '#9C27B0' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="electrical-services" size={24} color="#fff" />
              <Text variant="bodySmall" style={styles.metricLabel}>
                Voltaje Promedio
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                {avgVoltage.toFixed(1)} V
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: '#FF9800' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="current-exchange" size={24} color="#fff" />
              <Text variant="bodySmall" style={styles.metricLabel}>
                Corriente Promedio
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                {avgCurrent.toFixed(1)} A
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Gráfica de Potencia por Fase */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Potencia por Fase
            </Text>
            <BarChart
              data={powerData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Gráfica de Energía Acumulada */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Energía Acumulada por Fase
            </Text>
            <BarChart
              data={energyData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Gráfica de Voltajes Línea a Línea */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Voltajes Línea a Línea
            </Text>
            <LineChart
              data={voltageData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Detalles por Fase */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Detalles por Fase
            </Text>
            <View style={styles.phaseGrid}>
              {['A', 'B', 'C'].map((phase) => (
                <Surface key={phase} style={styles.phaseCard}>
                  <Text variant="titleSmall" style={styles.phaseTitle}>
                    Fase {phase}
                  </Text>
                  <View style={styles.phaseDetails}>
                    <View style={styles.phaseDetailRow}>
                      <Text variant="bodySmall">Voltaje:</Text>
                      <Text variant="bodyMedium" style={styles.phaseValue}>
                        {realTimeData[`V_RMS${phase}` as keyof typeof realTimeData]?.toFixed(1) || '0.0'} V
                      </Text>
                    </View>
                    <View style={styles.phaseDetailRow}>
                      <Text variant="bodySmall">Corriente:</Text>
                      <Text variant="bodyMedium" style={styles.phaseValue}>
                        {realTimeData[`I_RMS${phase}` as keyof typeof realTimeData]?.toFixed(1) || '0.0'} A
                      </Text>
                    </View>
                    <View style={styles.phaseDetailRow}>
                      <Text variant="bodySmall">Potencia:</Text>
                      <Text variant="bodyMedium" style={[
                        styles.phaseValue,
                        { color: (realTimeData[`PPROM_${phase}` as keyof typeof realTimeData] || 0) < 0 ? '#F44336' : '#4CAF50' }
                      ]}>
                        {realTimeData[`PPROM_${phase}` as keyof typeof realTimeData]?.toFixed(0) || '0'} W
                      </Text>
                    </View>
                  </View>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Impacto Ambiental */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Impacto Ambiental
            </Text>
            <Surface style={styles.environmentalCard}>
              <MaterialIcons name="eco" size={32} color="#4CAF50" />
              <View style={styles.environmentalContent}>
                <Text variant="headlineMedium" style={styles.co2Value}>
                  {Math.round(Math.abs(totalEnergy) * 0.233)} kg CO₂
                </Text>
                <Text variant="bodyMedium" style={styles.co2Label}>
                  Emisiones estimadas
                </Text>
              </View>
            </Surface>
          </Card.Content>
        </Card>

        {error && (
          <Card style={[styles.chartCard, styles.errorCard]}>
            <Card.Content>
              <View style={styles.errorContent}>
                <MaterialIcons name="error" size={24} color="#F44336" />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => dispatch(fetchEnergyData())}
                  style={styles.retryButton}
                >
                  Reintentar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  statusHeader: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 12,
  },
  metricContent: {
    alignItems: 'center',
    padding: 12,
  },
  metricLabel: {
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  metricValue: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  chart: {
    borderRadius: 16,
  },
  phaseGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  phaseCard: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 8,
  },
  phaseTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  phaseDetails: {
    gap: 4,
  },
  phaseDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseValue: {
    fontWeight: 'bold',
  },
  environmentalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  environmentalContent: {
    marginLeft: 16,
    flex: 1,
  },
  co2Value: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  co2Label: {
    color: theme.colors.onSurfaceVariant,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
  },
  errorContent: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    borderColor: '#F44336',
  },
});