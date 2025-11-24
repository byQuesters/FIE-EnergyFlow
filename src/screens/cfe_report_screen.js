import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import reportService from '../data/report_service';

const { width } = Dimensions.get('window');

const CFEReportScreen = ({ route, navigation }) => {
  const { buildingId = 'photon-001', buildingName = 'Edificio Principal'} = route.params || {};
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('ultimos7dias');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [buildingId, selectedPeriod]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener rango de fechas según periodo seleccionado
      const dateRanges = reportService.getDateRanges();
      const range = dateRanges[selectedPeriod];

      console.log(`📊 Generando reporte para ${buildingName}...`);
      console.log(`📅 Periodo: ${range.label}`);
      console.log(`🔍 Device ID: ${buildingId}`);

      // CONFIGURACIÓN DEL REPORTE
      const maxRecords = 10000; // Límite de registros
      
      // Factor de corrección: usa 1.0 con el código corregido del Photon
      // Si sigues viendo valores incorrectos, ajusta este factor
      const CORRECTION_FACTOR = 1.0; 
      
      // Modo acumulativo: true porque el Photon ahora envía kWh acumulativos
      const USE_ACCUMULATIVE_MODE = true;

      // Generar reporte
      const report = await reportService.generateReport(
        buildingId,
        buildingName,
        range.startDate,
        range.endDate,
        maxRecords,
        CORRECTION_FACTOR,
        USE_ACCUMULATIVE_MODE
      );

      if (!report.success) {
        setError(report.message || 'No hay datos disponibles');
        setReportData(null);
      } else {
        setReportData(report);
        console.log('✅ Reporte generado exitosamente');
        console.log(`💡 Consumo calculado: ${report.consumo.total.toFixed(2)} kWh`);
      }
    } catch (err) {
      console.error('❌ Error al cargar reporte:', err);
      setError('Error al cargar el reporte');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const periodOptions = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'ayer', label: 'Ayer' },
    { key: 'ultimos7dias', label: '7 días' },
    { key: 'mesActual', label: 'Mes actual' },
    { key: 'mesAnterior', label: 'Mes anterior' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <LinearGradient
          colors={colors.headerGradient || ['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reporte de Consumo</Text>
          <View style={styles.downloadButton} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Generando reporte...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !reportData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <LinearGradient
          colors={colors.headerGradient || ['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reporte de Consumo</Text>
          <TouchableOpacity onPress={loadReport} style={styles.downloadButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>
            {error || 'No hay datos disponibles'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadReport}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.headerGradient || ['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte de Consumo</Text>
        <TouchableOpacity onPress={loadReport} style={styles.downloadButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Selector de Periodo */}
      <View style={[styles.periodSelector, { backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.periodButton,
                selectedPeriod === option.key && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedPeriod(option.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === option.key ? '#fff' : colors.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header del Reporte */}
        <View style={[styles.reportHeader, { backgroundColor: colors.card }]}>
          <View style={styles.buildingInfo}>
            <View style={styles.buildingIconContainer}>
              <Ionicons name="business" size={40} color={colors.primary} />
            </View>
            <View style={styles.buildingDetails}>
              <Text style={[styles.buildingName, { color: colors.textPrimary }]}>
                {reportData.buildingName}
              </Text>
              <Text style={[styles.deviceId, { color: colors.textSecondary }]}>
                Device ID: {reportData.deviceId}
              </Text>
              <Text style={[styles.periodText, { color: colors.textSecondary }]}>
                {formatDate(reportData.periodo.inicio)} - {formatDate(reportData.periodo.fin)}
              </Text>
              <Text style={[styles.daysText, { color: colors.textSecondary }]}>
                {reportData.periodo.dias} día(s) • {reportData.totalRegistros} registros
              </Text>
            </View>
          </View>

          <View style={styles.updateInfo}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.updateText, { color: colors.textSecondary }]}>
              Última actualización: {formatDateTime(reportData.valoresActuales.timestamp)}
            </Text>
          </View>
        </View>

        {/* Total a Pagar - Destacado (inspirado en CFE) */}
        <LinearGradient
          colors={[colors.primary || '#3b82f6', colors.primaryDark || '#1e40af']}
          style={styles.totalSection}
        >
          <View style={styles.totalContent}>
            <Text style={styles.totalLabel}>CONSUMO TOTAL DEL PERIODO</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalAmount}>{reportData.consumo.total.toFixed(2)}</Text>
              <Text style={styles.totalUnit}>kWh</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.estimatedCostLabel}>Costo Estimado CFE</Text>
            <Text style={styles.estimatedCostAmount}>
              ${reportData.costos.total.toFixed(2)} MXN
            </Text>
            <Text style={styles.estimatedNote}>
              (Incluye IVA • Tarifa: ${reportData.costos.tarifaPorKwh}/kWh)
            </Text>
            
            {/* Advertencia si se alcanzó límite de registros */}
            {reportData.limitAlcanzado && (
              <View style={styles.warningBadge}>
                <Ionicons name="warning" size={16} color="#f59e0b" />
                <Text style={styles.warningText}>
                  Límite de {reportData.maxRecords.toLocaleString()} registros alcanzado
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Consumo por Fase */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Distribución de Consumo por Fase
            </Text>
          </View>
          
          <View style={styles.phaseGrid}>
            <View style={[styles.phaseCard, { backgroundColor: theme.dark ? colors.background : '#fef3c7' }]}>
              <Text style={[styles.phaseLabel, { color: '#f59e0b' }]}>Fase A</Text>
              <Text style={[styles.phaseValue, { color: colors.textPrimary }]}>
                {reportData.consumo.faseA.toFixed(2)}
              </Text>
              <Text style={[styles.phaseUnit, { color: colors.textSecondary }]}>kWh</Text>
              <Text style={[styles.phasePercent, { color: colors.textSecondary }]}>
                {((reportData.consumo.faseA / reportData.consumo.total) * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={[styles.phaseCard, { backgroundColor: theme.dark ? colors.background : '#dbeafe' }]}>
              <Text style={[styles.phaseLabel, { color: '#3b82f6' }]}>Fase B</Text>
              <Text style={[styles.phaseValue, { color: colors.textPrimary }]}>
                {reportData.consumo.faseB.toFixed(2)}
              </Text>
              <Text style={[styles.phaseUnit, { color: colors.textSecondary }]}>kWh</Text>
              <Text style={[styles.phasePercent, { color: colors.textSecondary }]}>
                {((reportData.consumo.faseB / reportData.consumo.total) * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={[styles.phaseCard, { backgroundColor: theme.dark ? colors.background : '#dcfce7' }]}>
              <Text style={[styles.phaseLabel, { color: '#10b981' }]}>Fase C</Text>
              <Text style={[styles.phaseValue, { color: colors.textPrimary }]}>
                {reportData.consumo.faseC.toFixed(2)}
              </Text>
              <Text style={[styles.phaseUnit, { color: colors.textSecondary }]}>kWh</Text>
              <Text style={[styles.phasePercent, { color: colors.textSecondary }]}>
                {((reportData.consumo.faseC / reportData.consumo.total) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Promedios del Periodo */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Promedios del Periodo
            </Text>
          </View>

          {/* Voltajes Promedio */}
          <View style={styles.metricsGroup}>
            <Text style={[styles.metricsGroupTitle, { color: colors.textSecondary }]}>
              Voltajes Promedio (V)
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase A</Text>
                <Text style={[styles.metricValue, { color: '#f59e0b' }]}>
                  {reportData.promedios.voltajes.faseA.toFixed(1)} V
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase B</Text>
                <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
                  {reportData.promedios.voltajes.faseB.toFixed(1)} V
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase C</Text>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>
                  {reportData.promedios.voltajes.faseC.toFixed(1)} V
                </Text>
              </View>
            </View>
          </View>

          {/* Corrientes Promedio */}
          <View style={styles.metricsGroup}>
            <Text style={[styles.metricsGroupTitle, { color: colors.textSecondary }]}>
              Corrientes Promedio (A)
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase A</Text>
                <Text style={[styles.metricValue, { color: '#f59e0b' }]}>
                  {reportData.promedios.corrientes.faseA.toFixed(2)} A
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase B</Text>
                <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
                  {reportData.promedios.corrientes.faseB.toFixed(2)} A
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase C</Text>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>
                  {reportData.promedios.corrientes.faseC.toFixed(2)} A
                </Text>
              </View>
            </View>
          </View>

          {/* Potencia Promedio */}
          <View style={styles.metricsGroup}>
            <Text style={[styles.metricsGroupTitle, { color: colors.textSecondary }]}>
              Potencia Promedio (kW)
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase A</Text>
                <Text style={[styles.metricValue, { color: '#f59e0b' }]}>
                  {reportData.promedios.potencias.faseA.toFixed(2)} kW
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase B</Text>
                <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
                  {reportData.promedios.potencias.faseB.toFixed(2)} kW
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fase C</Text>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>
                  {reportData.promedios.potencias.faseC.toFixed(2)} kW
                </Text>
              </View>
            </View>
            <View style={[styles.totalPowerRow, { backgroundColor: theme.dark ? '#1f2937' : '#f9fafb' }]}>
              <Text style={[styles.totalPowerLabel, { color: colors.textPrimary }]}>
                Potencia Total Promedio
              </Text>
              <Text style={[styles.totalPowerValue, { color: colors.primary }]}>
                {reportData.promedios.potencias.total.toFixed(2)} kW
              </Text>
            </View>
          </View>
        </View>

        {/* Valores Actuales */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Última Lectura del Periodo
            </Text>
          </View>

          <View style={styles.currentValuesGrid}>
            <View style={[styles.currentCard, { backgroundColor: theme.dark ? colors.background : '#fff7ed' }]}>
              <Text style={[styles.currentCardTitle, { color: colors.textSecondary }]}>
                Voltajes RMS (V)
              </Text>
              <View style={styles.currentCardValues}>
                <Text style={[styles.currentCardValue, { color: '#f59e0b' }]}>
                  A: {reportData.valoresActuales.voltajes.faseA.toFixed(1)}
                </Text>
                <Text style={[styles.currentCardValue, { color: '#3b82f6' }]}>
                  B: {reportData.valoresActuales.voltajes.faseB.toFixed(1)}
                </Text>
                <Text style={[styles.currentCardValue, { color: '#10b981' }]}>
                  C: {reportData.valoresActuales.voltajes.faseC.toFixed(1)}
                </Text>
              </View>
            </View>

            <View style={[styles.currentCard, { backgroundColor: theme.dark ? colors.background : '#eff6ff' }]}>
              <Text style={[styles.currentCardTitle, { color: colors.textSecondary }]}>
                Corrientes RMS (A)
              </Text>
              <View style={styles.currentCardValues}>
                <Text style={[styles.currentCardValue, { color: '#f59e0b' }]}>
                  A: {reportData.valoresActuales.corrientes.faseA.toFixed(2)}
                </Text>
                <Text style={[styles.currentCardValue, { color: '#3b82f6' }]}>
                  B: {reportData.valoresActuales.corrientes.faseB.toFixed(2)}
                </Text>
                <Text style={[styles.currentCardValue, { color: '#10b981' }]}>
                  C: {reportData.valoresActuales.corrientes.faseC.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Desglose de Costos (inspirado en CFE) */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Desglose de Costos Estimados
            </Text>
          </View>

          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                Consumo Total
              </Text>
              <Text style={[styles.costValue, { color: colors.textPrimary }]}>
                {reportData.consumo.total.toFixed(2)} kWh
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                Tarifa CFE (Estimada)
              </Text>
              <Text style={[styles.costValue, { color: colors.textPrimary }]}>
                ${reportData.costos.tarifaPorKwh.toFixed(2)} / kWh
              </Text>
            </View>

            <View style={[styles.costRow, styles.costDivider]}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                Subtotal Energía
              </Text>
              <Text style={[styles.costValue, { color: colors.textPrimary }]}>
                ${reportData.costos.subtotalEnergia.toFixed(2)}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                IVA (16%)
              </Text>
              <Text style={[styles.costValue, { color: colors.textPrimary }]}>
                ${reportData.costos.iva.toFixed(2)}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
                DAC (3%)
              </Text>
              <Text style={[styles.costValue, { color: colors.textSecondary }]}>
                ${reportData.costos.dac.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={[styles.totalCostLabel, { color: colors.textPrimary }]}>
                TOTAL ESTIMADO
              </Text>
              <Text style={[styles.totalCostValue, { color: '#10b981' }]}>
                ${reportData.costos.total.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.noteBox, { backgroundColor: theme.dark ? '#1f2937' : '#f0fdf4' }]}>
            <Ionicons name="information-circle" size={20} color="#10b981" />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Los costos son estimados basados en tarifa promedio CFE DAC. El costo real puede
              variar según tu contrato específico y región.
            </Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="server" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Datos históricos desde Supabase
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calculator" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Cálculos basados en {reportData.totalRegistros} lecturas
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Periodo de {reportData.periodo.dias} día(s)
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  downloadButton: {
    padding: 8,
  },
  periodSelector: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Header del Reporte
  reportHeader: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buildingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buildingIconContainer: {
    marginRight: 16,
  },
  buildingDetails: {
    flex: 1,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    marginBottom: 4,
  },
  periodText: {
    fontSize: 12,
    marginBottom: 2,
  },
  daysText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  updateText: {
    fontSize: 11,
    marginLeft: 6,
  },

  // Total Section (inspirado en CFE)
  totalSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  totalContent: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.9,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#fff',
    opacity: 0.3,
    marginVertical: 16,
  },
  estimatedCostLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    opacity: 0.9,
  },
  estimatedCostAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  estimatedNote: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  warningText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Secciones
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Fase Grid
  phaseGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phaseValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseUnit: {
    fontSize: 12,
    marginBottom: 4,
  },
  phasePercent: {
    fontSize: 11,
    fontStyle: 'italic',
  },

  // Metrics
  metricsGroup: {
    marginBottom: 20,
  },
  metricsGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPowerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  totalPowerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalPowerValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Current Values
  currentValuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  currentCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  currentCardValues: {
    alignItems: 'center',
  },
  currentCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  // Cost Breakdown
  costBreakdown: {
    marginTop: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  costDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
    marginTop: 8,
    paddingTop: 16,
  },
  costLabel: {
    fontSize: 14,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCostRow: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    borderBottomWidth: 2,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCostValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Note Box
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteText: {
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
  },
});

export default CFEReportScreen;
