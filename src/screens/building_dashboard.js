import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { fetchLatestData, fetchRecentData, checkServerStatus } from '../data/energy_data';
import { authService } from '../../lib/auth';
import { useTheme } from '../contexts/ThemeContext';
import SettingsModal from '../components/SettingsModal';

const { width } = Dimensions.get('window');

const BuildingDashboard = ({ route, navigation }) => {
  const { buildingId = 'photon-001', buildingName = 'Edificio Principal' } = route.params;
  const [activeTab, setActiveTab] = useState('realtime');
  const [currentData, setCurrentData] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [hourlyChart, setHourlyChart] = useState(null);
  const [serverStatus, setServerStatus] = useState({ isActive: true, lastUpdate: null });
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Hook de Tema
  const { theme } = useTheme();
  const { colors } = theme;

  // ---------------------------------------------------------------------------
  // Lógica de colores por Fase
  // ---------------------------------------------------------------------------
  const getPhaseStyle = (label) => {
    const l = label.toUpperCase();
    
    // Definición de colores adaptativos (Light / Dark)
    const redBg = theme.dark ? '#450a0a' : '#fee2e2'; 
    const redBorder = theme.dark ? '#991b1b' : '#fca5a5';
    
    const blueBg = theme.dark ? '#172554' : '#dbeafe';
    const blueBorder = theme.dark ? '#1e40af' : '#93c5fd';
    
    const yellowBg = theme.dark ? '#422006' : '#fef9c3'; 
    const yellowBorder = theme.dark ? '#a16207' : '#fde047';

    const defaultBg = theme.dark ? colors.background : '#f8fafc';

    if (l.endsWith(' CA') || l.endsWith(' C')) {
      return { backgroundColor: yellowBg, borderColor: yellowBorder, borderWidth: 1 };
    }
    if (l.endsWith(' BC') || l.endsWith(' B')) {
      return { backgroundColor: blueBg, borderColor: blueBorder, borderWidth: 1 };
    }
    if (l.endsWith(' AB') || l.endsWith(' A')) {
      return { backgroundColor: redBg, borderColor: redBorder, borderWidth: 1 };
    }

    return { backgroundColor: defaultBg, borderColor: 'transparent', borderWidth: 0 };
  };

  useEffect(() => {
    if (recentData.length > 0) {
      setHourlyChart(buildHourlyChart(recentData));
    }
  }, [colors, recentData]); 

  const buildHourlyChart = (rows = []) => {
    if (!rows.length) return null;
    const ordered = [...rows].reverse();
    const labels = ordered.map(r => new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const data = ordered.map(r => parseFloat((r.V_RMSA + r.V_RMSB + r.V_RMSC).toFixed(1)));
    return {
      labels,
      datasets: [
        {
          data,
          color: () => colors.chartLine || (theme.dark ? '#60a5fa' : '#3b82f6'),
          strokeWidth: 2,
        },
      ],
    };
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isUserAuthenticated();
      if (!isAuth) {
        navigation.replace('Auth');
      }
    };
    checkAuth();
  }, [navigation]);

  const handleBackToMap = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'EF - Mapa del Campus' }],
    });
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (confirmed) {
        await authService.logout();
        navigation.replace('EF - Autenticación');
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              await authService.logout();
              navigation.replace('Auth');
            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    const updateData = async () => {
      const status = await checkServerStatus(buildingId);
      setServerStatus(status);

      if (!status.isActive) {
        console.warn('⚠️ Servidor inactivo - Sin datos recientes');
      }

      const newData = await fetchLatestData(buildingId);
      if (newData) setCurrentData(newData);

      const recent = await fetchRecentData(buildingId, 5);
      setRecentData(recent);
    };

    updateData();
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, [buildingId]);

  if (!currentData) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando datos...</Text>
      </View>
    );
  }

  const bgColor = colors.chartBackground || colors.card || (theme.dark ? '#1f2937' : '#ffffff');

  const chartConfig = {
    backgroundColor: bgColor,
    backgroundGradientFrom: bgColor,
    backgroundGradientTo: bgColor,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${theme.dark ? '96, 165, 250' : '59, 130, 246'}, ${opacity})`,
    labelColor: (opacity = 1) => {
       if (theme.dark) return `rgba(229, 231, 235, ${opacity})`; 
       return `rgba(55, 65, 81, ${opacity})`;
    },
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.chartLine || (theme.dark ? '#60a5fa' : '#3b82f6')
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
      {!serverStatus.isActive && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Servidor Inactivo</Text>
          <Text style={styles.alertMessage}>
            El servidor está apagado o se ha detenido.{'\n'}
            Favor de reiniciarlo.
          </Text>
          {serverStatus.lastUpdate && (
            <Text style={styles.alertTime}>
              Última actualización hace {serverStatus.minutesAgo} minuto(s)
            </Text>
          )}
        </View>
      )}

      <View style={styles.summaryCards}>
        <LinearGradient colors={colors.summaryGradient || ['#abd388ff', '#83ae68ff']} style={styles.summaryCard}>
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

      {/* =========================================
        VOLTAJES: Divididos en 2 Columnas
        =========================================
      */}
      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Voltajes RMS (V)</Text>
        
        <View style={styles.splitGrid}>
          {/* Columna Izquierda: Fase Neutro (A, B, C) */}
          <View style={styles.splitColumn}>
            {[
              { l: 'V RMS A', v: currentData.realTimeData.V_RMSA },
              { l: 'V RMS B', v: currentData.realTimeData.V_RMSB },
              { l: 'V RMS C', v: currentData.realTimeData.V_RMSC },
            ].map((item, i) => (
              <View key={i} style={[styles.dataItemFull, getPhaseStyle(item.l)]}>
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>{item.l}</Text>
                <Text style={[styles.dataValue, { color: colors.primary }]}>{item.v}</Text>
              </View>
            ))}
          </View>

          {/* Columna Derecha: Fase Fase (AB, BC, CA) */}
          <View style={styles.splitColumn}>
            {[
              { l: 'V RMS AB', v: currentData.realTimeData.V_RMSAB },
              { l: 'V RMS BC', v: currentData.realTimeData.V_RMSBC },
              { l: 'V RMS CA', v: currentData.realTimeData.V_RMSCA }
            ].map((item, i) => (
              <View key={i} style={[styles.dataItemFull, getPhaseStyle(item.l)]}>
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>{item.l}</Text>
                <Text style={[styles.dataValue, { color: colors.primary }]}>{item.v}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* =========================================
        CORRIENTES: Los 3 en una sola línea
        =========================================
      */}
      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Corrientes RMS (A)</Text>
        <View style={styles.triGrid}>
          {[
            { l: 'I RMS A', v: currentData.realTimeData.I_RMSA },
            { l: 'I RMS B', v: currentData.realTimeData.I_RMSB },
            { l: 'I RMS C', v: currentData.realTimeData.I_RMSC }
          ].map((item, i) => (
            <View key={i} style={[styles.dataItemThird, getPhaseStyle(item.l)]}>
              <Text style={[styles.dataLabelSmall, { color: colors.textSecondary }]}>{item.l}</Text>
              <Text style={[styles.dataValueSmall, { color: colors.primary }]}>{item.v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* =========================================
        POTENCIA: Los 3 en una sola línea
        =========================================
      */}
      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Potencia Prom. (kW)</Text>
        <View style={styles.triGrid}>
           {[
            { l: 'P PROM A', v: currentData.realTimeData.PPROM_A },
            { l: 'P PROM B', v: currentData.realTimeData.PPROM_B },
            { l: 'P PROM C', v: currentData.realTimeData.PPROM_C }
          ].map((item, i) => (
            <View key={i} style={[styles.dataItemThird, getPhaseStyle(item.l)]}>
              <Text style={[styles.dataLabelSmall, { color: colors.textSecondary }]}>{item.l}</Text>
              <Text style={[styles.dataValueSmall, { color: colors.primary }]}>{item.v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* =========================================
        ENERGÍA: Los 3 en una sola línea
        =========================================
      */}
      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Energía (kWh)</Text>
        <View style={styles.triGrid}>
           {[
            { l: 'kWh A', v: currentData.realTimeData.kWhA },
            { l: 'kWh B', v: currentData.realTimeData.kWhB },
            { l: 'kWh C', v: currentData.realTimeData.kWhC }
          ].map((item, i) => (
            <View key={i} style={[styles.dataItemThird, getPhaseStyle(item.l)]}>
              <Text style={[styles.dataLabelSmall, { color: colors.textSecondary }]}>{item.l}</Text>
              <Text style={[styles.dataValueSmall, { color: colors.primary }]}>{item.v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Últimos 5 registros */}
      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Últimos 5 Registros</Text>
        {recentData.map((row, idx) => (
          <View key={row.timestamp} style={styles.historyRow}>
            <Text style={[styles.historyIndex, { color: colors.textSecondary }]}>{idx + 1}.</Text>
            <Text style={[styles.historyTime, { color: colors.text }]}>
              {new Date(row.timestamp).toLocaleString('es-MX', { 
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
              })}
            </Text>
            <Text style={styles.historyValue}>{(row.V_RMSA + row.V_RMSB + row.V_RMSC).toFixed(1)} V</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHistoricalData = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.predictionCta}
        onPress={() =>
          navigation.navigate('Predictions', {
            buildingId,
            buildingName,
          })
        }
      >
        <Text style={styles.predictionCtaText}>Predicciones</Text>
        <Ionicons name="arrow-forward-circle" size={22} color="#f0fdf4" />
      </TouchableOpacity>

      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Consumo por Hora (kWh)</Text>
        <LineChart
          key={theme.dark ? 'dark-line-chart' : 'light-line-chart'}
          data={hourlyChart || currentData.chartData.hourly}
          width={width - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Distribución por Fase (%)</Text>
        <BarChart
          key={theme.dark ? 'dark-bar-chart' : 'light-bar-chart'}
          data={currentData.chartData.phases}
          width={width - 60}
          height={220}
          chartConfig={barChartConfig}
          style={styles.chart}
        />
      </View>

      <View style={[styles.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Resumen del Día</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: 'Consumo Máximo', value: `${Math.max(currentData.realTimeData.kWhA, currentData.realTimeData.kWhB, currentData.realTimeData.kWhC).toFixed(1)} kWh` },
            { label: 'Consumo Mínimo', value: `${Math.min(currentData.realTimeData.kWhA, currentData.realTimeData.kWhB, currentData.realTimeData.kWhC).toFixed(1)} kWh` },
            { label: 'Promedio', value: `${((currentData.realTimeData.kWhA + currentData.realTimeData.kWhB + currentData.realTimeData.kWhC) / 3).toFixed(1)} kWh` },
            { label: 'Eficiencia', value: currentData.status === 'low' ? '95%' : currentData.status === 'normal' ? '88%' : currentData.status === 'high' ? '75%' : '62%' }
          ].map((item, i) => (
            <View key={i} style={[styles.summaryItem, { backgroundColor: theme.dark ? colors.background : '#f8fafc' }]}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.summaryItemValue, { color: colors.primary }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SettingsModal 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        systemInfo={null} 
      />

      <LinearGradient 
        colors={colors.headerGradient} 
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: 'rgba(255,255,255,0.4)' }]}
            onPress={handleBackToMap}
          >
            <Ionicons name="arrow-back-outline" size={22} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{buildingName}</Text>
            <Text style={styles.headerSubtitle}>
              Última actualización: {new Date(currentData.realTimeData.timestamp).toLocaleTimeString()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <TouchableOpacity
              style={styles.reportButtonHeader}
              onPress={() => navigation.navigate('CFEReport', { buildingId, buildingName })}
            >
              <Ionicons name="document-text-outline" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSettingsVisible(true)}
              style={styles.settingsButtonHeader}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.tabsContainer, { backgroundColor: colors.inactiveTab }]}>
        <TouchableOpacity
          style={[
            styles.tab, 
            { borderColor: colors.border },
            activeTab === 'realtime' && { backgroundColor: colors.activeTab, borderWidth: 0 }
          ]}
          onPress={() => setActiveTab('realtime')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.textSecondary },
            activeTab === 'realtime' && { color: colors.textInverse }
          ]}>
            Tiempo Real
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab, 
            { borderColor: colors.border },
            activeTab === 'historical' && { backgroundColor: colors.activeTab, borderWidth: 0 }
          ]}
          onPress={() => setActiveTab('historical')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.textSecondary },
            activeTab === 'historical' && { color: colors.textInverse }
          ]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} contentContainerStyle={{flexGrow: 1}}>
        {activeTab === 'realtime' ? renderRealTimeData() : renderHistoricalData()}
        <View style={{ height: insets.bottom || 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: '#991b1b',
    marginBottom: 8,
    lineHeight: 22,
  },
  alertTime: {
    fontSize: 14,
    color: '#7f1d1d',
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  historyIndex: {
    width: 20,
  },
  historyTime: {
    flex: 1,
  },
  historyValue: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' }),
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 1)',
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mlButtonHeader: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  mlButtonHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reportButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
  settingsButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 0,
    padding: 4,
    paddingTop: 15,
    shadowColor: '#00000034',
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
    borderWidth: 1,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
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
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  dataCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  chartCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // Nuevos estilos para layout dividido (Voltaje)
  splitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitColumn: {
    width: '48%',
  },
  // Nuevos estilos para layout de 3 (Corriente, Potencia, Energía)
  triGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap', // Forzar una línea
  },
  
  // Items individuales
  dataItem: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dataItemFull: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dataItemThird: {
    width: '32%', // 32% * 3 = 96%, dejando espacio para gaps
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  
  dataLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Estilos más pequeños para cuando hay 3 en línea
  dataLabelSmall: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataValueSmall: {
    fontSize: 15, // Reducido para que quepa
    fontWeight: 'bold',
    textAlign: 'center',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  predictionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    columnGap: 8,
  },
  predictionCtaText: {
    color: '#f0fdf4',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  summaryItem: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default BuildingDashboard;