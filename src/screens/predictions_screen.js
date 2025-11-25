import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { fetchRecentData } from '../data/energy_data';

const PERIODS = {
  day: { label: 'Día', factor: 1, detail: 'Promedio diario' },
  week: { label: 'Semana', factor: 7, detail: 'Promedio x 7 días' },
  month: { label: 'Mes', factor: 28, detail: '7 días x 4 semanas' },
  year: { label: 'Año', factor: 336, detail: '7 días x 4 semanas x 12 meses' },
};

const SENSOR_FIELDS = [
  { key: 'V_RMSA', label: 'V RMS A', unit: 'V' },
  { key: 'V_RMSB', label: 'V RMS B', unit: 'V' },
  { key: 'V_RMSC', label: 'V RMS C', unit: 'V' },
  { key: 'V_RMSAB', label: 'V RMS AB', unit: 'V' },
  { key: 'V_RMSBC', label: 'V RMS BC', unit: 'V' },
  { key: 'V_RMSCA', label: 'V RMS CA', unit: 'V' },
  { key: 'I_RMSA', label: 'I RMS A', unit: 'A' },
  { key: 'I_RMSB', label: 'I RMS B', unit: 'A' },
  { key: 'I_RMSC', label: 'I RMS C', unit: 'A' },
  { key: 'PPROM_A', label: 'P PROM A', unit: 'kW' },
  { key: 'PPROM_B', label: 'P PROM B', unit: 'kW' },
  { key: 'PPROM_C', label: 'P PROM C', unit: 'kW' },
  { key: 'kWhA', label: 'Energía A', unit: 'kWh' },
  { key: 'kWhB', label: 'Energía B', unit: 'kWh' },
  { key: 'kWhC', label: 'Energía C', unit: 'kWh' },
];

const PredictionsScreen = ({ navigation, route }) => {
  const { buildingId = 'photon-001', buildingName = 'Edificio' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors, dark } = theme;

  const [period, setPeriod] = useState('week');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchRecentData(buildingId, 100);
        setRawData(rows || []);
      } catch (err) {
        console.error('Error cargando datos para predicciones', err);
        setError('No pudimos obtener las últimas lecturas del sensor.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [buildingId]);

  const computed = useMemo(() => {
    const factor = PERIODS[period]?.factor || 1;

    const metrics = SENSOR_FIELDS.map((field) => {
      const values = rawData
        .map((row) => Number(row[field.key]))
        .filter((n) => !Number.isNaN(n));

      const total = values.reduce((acc, v) => acc + v, 0);
      const average = values.length ? total / values.length : 0;
      const projected = average * factor;

      return {
        ...field,
        count: values.length,
        total: parseFloat(total.toFixed(2)),
        average: parseFloat(average.toFixed(2)),
        projected: parseFloat(projected.toFixed(2)),
      };
    });

    const lastUpdate = rawData.length ? new Date(rawData[0].timestamp) : null;

    return {
      metrics,
      factor,
      lastUpdate,
      sampleCount: rawData.length,
    };
  }, [period, rawData]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.headerGradient}
        style={[styles.header, { paddingTop: insets.top + 18 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { borderColor: 'rgba(255,255,255,0.4)' }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Predicciones</Text>
            <Text style={styles.subtitle}>{buildingName}</Text>
          </View>
        </View>
        <View style={styles.periodRow}>
          {Object.entries(PERIODS).map(([key, info]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setPeriod(key)}
              style={[
                styles.periodButton,
                {
                  backgroundColor: period === key ? colors.activeTab : 'rgba(255,255,255,0.14)',
                  borderColor: period === key ? 'transparent' : 'rgba(255,255,255,0.25)',
                },
              ]}
            >
              <Text style={styles.periodText}>{info.label}</Text>
              <Text style={styles.periodDetail}>{info.detail}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: dark ? '#0f172a' : '#ecfdf3', borderColor: colors.border }]}>
          <View style={styles.bannerTextWrap}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              Promedio x factor seleccionado
            </Text>
            <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
              Usamos el promedio de cada variable y lo multiplicamos por días, semanas y meses ({PERIODS[period].factor}x) para proyectar el consumo en el periodo elegido.
            </Text>
            {computed.lastUpdate && (
              <Text style={[styles.bannerMeta, { color: colors.textSecondary }]}>
                Última lectura: {computed.lastUpdate.toLocaleString()}
              </Text>
            )}
          </View>
          <View style={[styles.bannerBadge, { backgroundColor: '#16a34a' }]}>
            <Text style={styles.bannerBadgeText}>{PERIODS[period].factor}x</Text>
            <Text style={styles.bannerBadgeSub}>Factor</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Calculando promedios...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorBox, { borderColor: colors.border }]}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <View style={styles.cardsGrid}>
            {computed.metrics.map((metric) => (
              <View
                key={metric.key}
                style={[
                  styles.metricCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.metricHeader}>
                  <Text style={[styles.metricLabel, { color: colors.text }]}>{metric.label}</Text>
                  <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{metric.unit}</Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {metric.projected} {metric.unit}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  Promedio: {metric.average} | Lecturas: {metric.count}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  Suma a la fecha: {metric.total} {metric.unit}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerText: {
    alignItems: 'flex-end',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    marginTop: 4,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  periodText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  periodDetail: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  banner: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  bannerMeta: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  bannerBadge: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  bannerBadgeSub: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontSize: 12,
  },
  loadingBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 8,
    fontWeight: '500',
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 12,
  },
});

export default PredictionsScreen;
