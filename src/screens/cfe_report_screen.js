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
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../contexts/ThemeContext';
import reportService from '../data/report_service';

const CFEReportScreen = ({ route, navigation }) => {
  const { buildingId = 'photon-001', buildingName = 'Edificio Principal' } = route.params || {};
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('ultimos7dias');
  const [selectedTariff, setSelectedTariff] = useState('DAC'); // 'DAC' | 'GDMTO'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [buildingId, selectedPeriod, selectedTariff]); 

  const toggleTariff = () => {
    const newTariff = selectedTariff === 'DAC' ? 'GDMTO' : 'DAC';
    setSelectedTariff(newTariff);
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!reportService || !reportService.getDateRanges) {
        throw new Error("Servicio de reportes no disponible");
      }

      const dateRanges = reportService.getDateRanges();
      const range = dateRanges[selectedPeriod];
      const maxRecords = 10000; 
      const CORRECTION_FACTOR = 1.0; 
      const USE_ACCUMULATIVE_MODE = true;

      const report = await reportService.generateReport(
        buildingId,
        buildingName,
        range.startDate,
        range.endDate,
        maxRecords,
        CORRECTION_FACTOR,
        USE_ACCUMULATIVE_MODE, 
        selectedTariff         
      );

      if (!report.success) {
        setError(report.message || 'No hay datos disponibles para este periodo');
        setReportData(null);
      } else {
        const enrichedData = {
          ...report,
          fechaLimitePago: new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString('es-MX'),
          periodoFacturado: `${formatDateShort(report.periodo.inicio)} - ${formatDateShort(report.periodo.fin)}`,
          tarifa: report.costos.tarifaNombre, 
          noMedidor: buildingId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10),
        };
        setReportData(enrichedData);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
  };

  const generatePDF = async () => {
    if (!reportData) return;
    setGeneratingPdf(true);

    try {
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica', sans-serif; color: #333; margin: 0; padding: 20px; background: #fff; }
              .header { border-bottom: 4px solid #007a3e; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              .logo-text { color: #007a3e; font-weight: bold; font-size: 24px; }
              .sub-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .user-info { width: 60%; font-size: 12px; line-height: 1.4; }
              .total-box { width: 35%; text-align: right; }
              .total-label { color: #007a3e; font-weight: bold; font-size: 14px; }
              .total-amount { font-size: 36px; font-weight: bold; color: #000; }
              .limit-date { font-size: 12px; margin-top: 5px; }
              .section-title { background-color: #007a3e; color: white; padding: 5px 10px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
              th { text-align: left; border-bottom: 2px solid #ccc; padding: 5px; color: #007a3e; }
              td { padding: 8px 5px; border-bottom: 1px solid #eee; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .cost-breakdown { display: flex; justify-content: space-between; }
              .breakdown-left { width: 48%; }
              .breakdown-right { width: 48%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; }
              .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-text">RERPORTE</div>
              <div style="font-size: 10px; text-align: right;">SUMINISTRADOR DE<br/>SERVICIOS BÁSICOS</div>
            </div>
            <div class="sub-header">
              <div class="user-info">
                <div style="font-size: 16px; font-weight: bold;">${reportData.buildingName}</div>
                <div>ID MEDIDOR: ${reportData.noMedidor}</div>
                <div>TARIFA: ${reportData.tarifa}</div>
                <div>PERIODO: ${reportData.periodoFacturado}</div>
              </div>
              <div class="total-box">
                <div class="total-label">TOTAL A PAGAR</div>
                <div class="total-amount">$${reportData.costos.total.toFixed(2)} MXN</div>
                <div class="limit-date">Pagar antes de: <br/><b>${reportData.fechaLimitePago}</b></div>
              </div>
            </div>
            <div class="section-title">DETALLE DE CONSUMO</div>
            <table>
              <tr><th>Concepto</th><th class="text-right">Lectura Actual</th><th class="text-right">Lectura Ant.</th><th class="text-right">Total</th></tr>
              <tr>
                <td>Energía (kWh)</td>
                <td class="text-right">${reportData.consumo.final.toFixed(0)}</td>
                <td class="text-right">${reportData.consumo.inicial.toFixed(0)}</td>
                <td class="text-right bold">${reportData.consumo.total.toFixed(2)}</td>
              </tr>
            </table>
            <div class="section-title">DESGLOSE DE COSTOS</div>
            <div class="cost-breakdown">
              <div class="breakdown-left">
                <table>
                  <tr><td>Energía ($${reportData.costos.tarifaPorKwh}/kWh)</td><td class="text-right">$${(reportData.costos.subtotalEnergia - reportData.costos.cargoSuministro).toFixed(2)}</td></tr>
                  <tr><td>Suministro</td><td class="text-right">$${reportData.costos.cargoSuministro.toFixed(2)}</td></tr>
                </table>
              </div>
              <div class="breakdown-right">
                <table>
                  <tr><td>Subtotal</td><td class="text-right">$${reportData.costos.subtotalEnergia.toFixed(2)}</td></tr>
                  <tr><td>IVA 16%</td><td class="text-right">$${reportData.costos.iva.toFixed(2)}</td></tr>
                  <tr><td>DAP</td><td class="text-right">$${reportData.costos.dac.toFixed(2)}</td></tr>
                  <tr style="border-top: 2px solid #333;"><td class="bold">Total</td><td class="text-right bold" style="font-size: 16px;">$${reportData.costos.total.toFixed(2)}</td></tr>
                </table>
              </div>
            </div>
            <div class="footer">Comisión Federal de Electricidad | Energy Flow Monitor System 2025</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const periodOptions = [
    { key: 'ultimos7dias', label: 'Semanal' },
    { key: 'mesActual', label: 'Mes Actual' },
    { key: 'mesAnterior', label: 'Mes Anterior' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={colors.headerGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estado de Cuenta</Text>
          <View style={{width: 40}} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Calculando consumo...</Text>
        </View>
      </View>
    );
  }

  if (error || !reportData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={colors.headerGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estado de Cuenta</Text>
          <View style={{width: 40}} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReport}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Unificado */}
      <LinearGradient colors={colors.headerGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado de Cuenta</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTariff} style={styles.iconButton}>
            <Ionicons name={selectedTariff === 'DAC' ? "home-outline" : "business-outline"} size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={generatePDF} style={styles.iconButton} disabled={generatingPdf}>
            {generatingPdf ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="print-outline" size={25} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.periodContainer}>
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.periodTab, 
              { backgroundColor: theme.dark ? colors.card : '#e0e0e0' },
              selectedPeriod === option.key && styles.periodTabActive
            ]}
            onPress={() => setSelectedPeriod(option.key)}
          >
            <Text style={[styles.periodText, { color: colors.textSecondary }, selectedPeriod === option.key && styles.periodTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.billCard, { backgroundColor: colors.card, borderTopColor: '#007a3e' }]}>
          <View style={styles.billHeader}>
            <View>
              <Text style={[styles.billLogo, { color: '#007a3e' }]}>REPORTE</Text>
              <Text style={[styles.billSlogan, { color: colors.textSecondary }]}>Suministrador de Servicios Básicos</Text>
            </View>
            <View style={styles.billTotalContainer}>
              <Text style={[styles.billTotalLabel, { color: colors.text }]}>TOTAL A PAGAR</Text>
              <Text style={[styles.billTotalAmount, { color: colors.text }]}>
                ${Math.floor(reportData.costos.total)}
                <Text style={[styles.billTotalDecimals, { color: colors.text }]}>.{reportData.costos.total.toFixed(2).split('.')[1] || '00'} </Text>
                <Text style={[styles.billCurrency, { color: colors.textSecondary }]}>MXN</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.billDivider, { backgroundColor: colors.border }]} />

          <View style={styles.billInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Periodo Facturado</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>{reportData.periodoFacturado}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Límite de Pago</Text>
              <Text style={[styles.billValue, { color: '#d32f2f' }]}>{reportData.fechaLimitePago}</Text>
            </View>
          </View>

          <View style={[styles.consumptionGauge, { backgroundColor: theme.dark ? colors.background : '#f9f9f9' }]}>
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeTitle, { color: colors.textSecondary }]}>
                {selectedTariff === 'DAC' ? 'Consumo Doméstico' : 'Consumo Comercial'}
              </Text>
              <Text style={[styles.gaugeValue, { color: reportData.consumo.total > 500 ? '#d32f2f' : '#2e7d32' }]}>
                {reportData.consumo.total.toFixed(0)} kWh
              </Text>
            </View>
            <View style={[styles.gaugeBarBg, { backgroundColor: theme.dark ? '#374151' : '#ddd' }]}>
              <LinearGradient colors={['#2e7d32', '#fdd835', '#d32f2f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gaugeGradient} />
              <View style={[styles.gaugeIndicator, { left: `${Math.min((reportData.consumo.total / 1000) * 100, 100)}%`, backgroundColor: theme.dark ? '#fff' : '#000' }]} />
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabelText}>Bajo</Text>
              <Text style={styles.gaugeLabelText}>Medio</Text>
              <Text style={styles.gaugeLabelText}>Alto</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={styles.sectionHeader}>Detalle de la Factura</Text>
          
          <View style={[styles.tableHeader, { backgroundColor: theme.dark ? colors.background : '#f0f0f0' }]}>
            <Text style={[styles.th, { flex: 1, color: colors.textSecondary }]}>Concepto</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right', color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1, color: colors.text }]}>Energía (kWh)</Text>
            <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: 'bold', color: colors.text }]}>
              {reportData.consumo.total.toFixed(0)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Energía</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>${reportData.costos.subtotalEnergia.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>IVA 16%</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>${reportData.costos.iva.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>DAP</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>${reportData.costos.dac.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.divider, { marginVertical: 10, backgroundColor: colors.border }]} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelText}>Total del Periodo</Text>
            <Text style={styles.totalValueText}>${reportData.costos.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={styles.sectionHeader}>Información del Servicio</Text>
          <View style={styles.techRow}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.techText, { color: colors.textSecondary }]}>{reportData.buildingName}</Text>
          </View>
          <View style={styles.techRow}>
            <Ionicons name="barcode-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.techText, { color: colors.textSecondary }]}>Medidor: {reportData.noMedidor}</Text>
          </View>
          <View style={styles.techRow}>
            <Ionicons name="flash-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.techText, { color: colors.textSecondary }]}>Tarifa: {reportData.tarifa}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.generatePdfBtn} onPress={generatePDF}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.generatePdfText}>Descargar PDF Oficial</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  headerActions: { flexDirection: 'row' },
  // Estilo Unificado Solicitado
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  retryButton: { backgroundColor: '#007a3e', padding: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  periodContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15, paddingHorizontal: 10 },
  periodTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 5 },
  periodTabActive: { backgroundColor: '#007a3e' },
  periodText: { fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  content: { paddingHorizontal: 15 },
  billCard: { borderRadius: 10, padding: 20, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, borderTopWidth: 6 },
  billHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  billLogo: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  billSlogan: { fontSize: 10, width: 120 },
  billTotalContainer: { alignItems: 'flex-end' },
  billTotalLabel: { fontSize: 12, fontWeight: 'bold' },
  billTotalAmount: { fontSize: 28, fontWeight: 'bold' },
  billTotalDecimals: { fontSize: 16 },
  billCurrency: { fontSize: 12 },
  billDivider: { height: 1, marginVertical: 15 },
  billInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontSize: 12, marginBottom: 2 },
  billValue: { fontSize: 14, fontWeight: 'bold' },
  consumptionGauge: { marginTop: 20, padding: 10, borderRadius: 8 },
  gaugeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  gaugeTitle: { fontSize: 12, fontWeight: 'bold' },
  gaugeValue: { fontSize: 12, fontWeight: 'bold' },
  gaugeBarBg: { height: 10, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  gaugeGradient: { width: '100%', height: '100%' },
  gaugeIndicator: { position: 'absolute', top: 0, bottom: 0, width: 4, borderRadius: 2, zIndex: 2 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  gaugeLabelText: { fontSize: 10, color: '#888' },
  sectionCard: { borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#007a3e', marginBottom: 15 },
  tableHeader: { flexDirection: 'row', padding: 8, borderRadius: 4, marginBottom: 5 },
  th: { fontSize: 11, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 8 },
  td: { fontSize: 12 },
  divider: { height: 1, marginVertical: 8 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  costLabel: { fontSize: 13 },
  costValue: { fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  totalLabelText: { fontSize: 16, fontWeight: 'bold', color: '#007a3e' },
  totalValueText: { fontSize: 18, fontWeight: 'bold', color: '#007a3e' },
  techRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  techText: { marginLeft: 10, fontSize: 13 },
  generatePdfBtn: { flexDirection: 'row', backgroundColor: '#007a3e', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginVertical: 10, elevation: 3 },
  generatePdfText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});

export default CFEReportScreen;