import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_DEVICE_ID = 'photon-001';
const REFRESH_MS = 60000; // Refresco automático para mantener la serie actualizada
const SAMPLE_LIMIT = 100; // Tomamos 100 lecturas más recientes para la regresión
const FUTURE_HORIZON = 5; // Cantidad de periodos futuros estimados que se dibujan

const MLPredictionScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { buildingId, buildingName } = route.params || {};
  const deviceId = buildingId || DEFAULT_DEVICE_ID;

  const [granularity, setGranularity] = useState('day'); // day | month | year
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [series, setSeries] = useState([]);
  const [regressionSeries, setRegressionSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [nextPoint, setNextPoint] = useState(null);
  const [extraAverages, setExtraAverages] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchLastSamples();
    const interval = setInterval(fetchLastSamples, REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  useEffect(() => {
    if (rawData.length) {
      buildRegression(rawData, granularity);
    } else {
      setSeries([]);
      setRegressionSeries([]);
      setStats(null);
    }
  }, [rawData, granularity]);

  const fetchLastSamples = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('ElectricalData')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(SAMPLE_LIMIT);

      if (error) throw error;

      const ordered = (data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setRawData(ordered);
      computeExtraAverages(ordered);
    } catch (err) {
      console.error('Load regression data error', err);
      setErrorMessage('No pudimos cargar datos recientes. Intenta de nuevo.');
      setRawData([]);
      setExtraAverages([]);
    } finally {
      setLoading(false);
    }
  };

  const aggregateData = (rows = [], mode = 'day') => {
    const map = new Map();
    rows.forEach((row) => {
      const date = new Date(row.timestamp);
      let key;
      if (mode === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (mode === 'year') {
        key = `${date.getFullYear()}`;
      } else {
        key = date.toISOString().slice(0, 10);
      }
      const sum = (row.kWhA || 0) + (row.kWhB || 0) + (row.kWhC || 0);
      map.set(key, (map.get(key) || 0) + sum);
    });

    const toDate = (label) => {
      if (mode === 'year') return new Date(Number(label), 0, 1);
      if (mode === 'month') {
        const [y, m] = label.split('-');
        return new Date(Number(y), Number(m) - 1, 1);
      }
      return new Date(label);
    };

    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: parseFloat(value.toFixed(2)), sort: toDate(label).getTime() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, value }) => ({ label, value }));
  };

  const linearRegression = (xs, ys) => {
    const n = xs.length;
    if (n === 0) return { m: 0, b: 0 };
    const sumx = xs.reduce((s, c) => s + c, 0);
    const sumy = ys.reduce((s, c) => s + c, 0);
    const sumxy = xs.reduce((s, c, i) => s + c * ys[i], 0);
    const sumx2 = xs.reduce((s, c) => s + c * c, 0);
    const denom = n * sumx2 - sumx * sumx;
    const m = denom === 0 ? 0 : (n * sumxy - sumx * sumy) / denom;
    const b = (sumy - m * sumx) / n;
    return { m, b };
  };

  const computeStats = (ys = [], yhat = []) => {
    if (!ys.length) {
      return {
        r2: 0,
        mean: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }
    const mean = ys.reduce((s, v) => s + v, 0) / ys.length;
    const variance = ys.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / ys.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const ssTot = ys.reduce((s, v) => s + Math.pow(v - mean, 2), 0);
    const ssRes = ys.reduce((s, v, i) => s + Math.pow(v - (yhat[i] ?? mean), 2), 0);
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    return {
      r2,
      mean,
      stdDev,
      min,
      max,
      count: ys.length,
    };
  };

  const buildRegression = (rows, mode) => {
    const aggregated = aggregateData(rows, mode);
    setSeries(aggregated);
    if (!aggregated.length) {
      setRegressionSeries([]);
      setStats(null);
      setNextPoint(null);
      return;
    }

    const xs = aggregated.map((_, idx) => idx);
    const ys = aggregated.map((p) => p.value);
    const { m, b } = linearRegression(xs, ys);
    const preds = aggregated.map((p, idx) => ({
      label: p.label,
      value: parseFloat((m * idx + b).toFixed(2)),
    }));
    const futurePoints = [];
    let lastLabel = aggregated.length ? aggregated[aggregated.length - 1].label : null;
    for (let i = 1; i <= FUTURE_HORIZON; i++) {
      lastLabel = getNextLabel(lastLabel, mode);
      futurePoints.push({
        label: lastLabel,
        value: parseFloat((m * (xs.length - 1 + i) + b).toFixed(2)),
      });
    }
    const nextLabel = futurePoints.length ? futurePoints[0].label : null;
    const nextPredValue = futurePoints.length ? futurePoints[0].value : null;
    const statsObj = computeStats(ys, preds.map((p) => p.value));

    setRegressionSeries([...preds, ...futurePoints]);
    setNextPoint(nextLabel ? { label: nextLabel, value: nextPredValue } : null);
    setStats({ ...statsObj, slope: m, intercept: b });
  };

  const getNextLabel = (label, mode) => {
    if (!label) return null;
    if (mode === 'year') {
      const year = Number(label);
      return `${year + 1}`;
    }
    if (mode === 'month') {
      const [y, m] = label.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      date.setMonth(date.getMonth() + 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    const date = new Date(label);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  const computeExtraAverages = (rows = []) => {
    const fields = [
      { key: 'V_RMSA', label: 'V RMS A', unit: 'V' },
      { key: 'V_RMSB', label: 'V RMS B', unit: 'V' },
      { key: 'V_RMSC', label: 'V RMS C', unit: 'V' },
      { key: 'I_RMSA', label: 'I RMS A', unit: 'A' },
      { key: 'I_RMSB', label: 'I RMS B', unit: 'A' },
      { key: 'I_RMSC', label: 'I RMS C', unit: 'A' },
      { key: 'PPROM_A', label: 'P Prom A', unit: 'kW' },
      { key: 'PPROM_B', label: 'P Prom B', unit: 'kW' },
      { key: 'PPROM_C', label: 'P Prom C', unit: 'kW' },
      { key: 'kWhA', label: 'kWh A', unit: 'kWh' },
      { key: 'kWhB', label: 'kWh B', unit: 'kWh' },
      { key: 'kWhC', label: 'kWh C', unit: 'kWh' },
    ];

    const results = fields
      .map((f) => {
        const values = rows
          .map((r) => Number(r[f.key]))
          .filter((v) => Number.isFinite(v));
        if (!values.length) return null;
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        return { label: f.label, value: avg, unit: f.unit };
      })
      .filter(Boolean);
    setExtraAverages(results);
  };

  const formatLabel = (label) => {
    if (granularity === 'year') return label;
    if (granularity === 'month') {
      const [y, m] = label.split('-');
      return `${m}/${String(y).slice(2)}`;
    }
    return label.slice(5);
  };

  const labelsForChart = useMemo(() => {
    const allPoints = [...series, ...regressionSeries.slice(series.length)];
    const lbls = allPoints.map((p) => formatLabel(p.label));
    const total = lbls.length;
    const skipEvery = total > 12 ? Math.ceil(total / 12) : 1;
    return lbls.map((label, idx) => (idx % skipEvery === 0 ? label : ''));
  }, [series, granularity, regressionSeries]);

  const lineChartData = useMemo(() => {
    const actual = [...series.map((p) => p.value)];
    const regression = regressionSeries.map((p) => p.value);
    // Alineamos longitud de actual a la de regression para que chart-kit pinte ambos correctamente
    while (actual.length < regression.length) {
      actual.push(null);
    }
    return {
      labels: labelsForChart,
      datasets: [
        { data: actual, color: () => '#2563eb', strokeWidth: 2, withDots: true },
        { data: regression, color: () => '#dc2626', strokeWidth: 2, withDots: true },
      ],
    };
  }, [labelsForChart, regressionSeries, series]);

  const barChartData = useMemo(() => ({
    labels: series.map((p) => formatLabel(p.label)),
    datasets: [{ data: series.map((p) => p.value) }],
  }), [series, granularity]);

  const chartWidth = Math.min(1200, Math.max(360, Platform.OS === 'web' ? 960 : 360));

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#93ab6bff', '#b7c586ff']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Análisis de Regresión</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {buildingName ? `${buildingName} (${deviceId})` : `Dispositivo: ${deviceId}`}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Granularidad</Text>
            <TouchableOpacity onPress={fetchLastSamples} style={styles.refreshBtn} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.refreshText}>Actualizar</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.unitRow}>
            {[
              { key: 'day', label: 'Días' },
              { key: 'month', label: 'Meses' },
              { key: 'year', label: 'Años' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setGranularity(opt.key)}
                style={[styles.unitBtn, granularity === opt.key && styles.unitBtnActive]}
              >
                <Text style={[styles.unitText, granularity === opt.key && styles.unitTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {!loading && !series.length && !errorMessage ? (
            <Text style={styles.note}>No hay datos para mostrar aún.</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Regresión lineal (100 muestras más recientes)</Text>
          {series.length === 0 ? (
            <Text style={styles.note}>Carga datos para visualizar la tendencia.</Text>
          ) : (
            <LineChart
              data={lineChartData}
              width={chartWidth}
              height={260}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(34,34,34,${opacity})`,
                labelColor: (opacity = 1) => `rgba(55,65,81,${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          )}
          {nextPoint && (
            <Text style={styles.projectionText}>
              Próximo periodo estimado ({formatLabel(nextPoint.label)}): {nextPoint.value} kWh
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Variables estadísticas</Text>
          {stats ? (
            <View style={styles.statsGrid}>
              {[
                { label: 'R²', value: stats.r2.toFixed(3) },
                { label: 'Pendiente', value: stats.slope.toFixed(4) },
                { label: 'Intercepto', value: stats.intercept.toFixed(2) },
                { label: 'Promedio', value: stats.mean.toFixed(2) },
                { label: 'Desviación', value: stats.stdDev.toFixed(2) },
                { label: 'Mínimo', value: stats.min.toFixed(2) },
                { label: 'Máximo', value: stats.max.toFixed(2) },
                { label: 'Muestras', value: stats.count },
              ].map((item) => (
                <View key={item.label} style={styles.statItem}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.note}>Corre la carga para ver estadísticas.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promedios variables eléctricas</Text>
          {extraAverages.length ? (
            <View style={styles.statsGrid}>
              {extraAverages.map((item) => (
                <View key={item.label} style={styles.statItem}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value.toFixed(2)} {item.unit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.note}>Sin lecturas suficientes para promediar.</Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingTop: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  backBtn: { marginRight: 8, backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 20 },
  backText: { color: 'white', fontSize: 18 },
  headerTitle: { flex: 1, textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerSubtitle: { textAlign: 'center', color: '#f8fafc', marginTop: 4, fontWeight: '600' },
  container: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { color: '#374151', fontWeight: '700', marginBottom: 6 },
  unitRow: { flexDirection: 'row', marginTop: 6 },
  unitBtn: { flex: 1, padding: 10, marginRight: 6, borderRadius: 8, backgroundColor: '#eef2e9', alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#93ab6b' },
  unitText: { color: '#374151', fontWeight: '600' },
  unitTextActive: { color: 'white' },
  note: { color: '#6b7280', fontStyle: 'italic' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refreshBtn: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  refreshText: { color: 'white', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  statLabel: { color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  statValue: { color: '#111827', fontWeight: '800', fontSize: 16 },
  errorText: { color: '#b91c1c', fontWeight: '600', marginTop: 8 },
  projectionText: { color: '#065f46', fontWeight: '700', marginTop: 8 },
});

export default MLPredictionScreen;
