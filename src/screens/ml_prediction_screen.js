import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

const MLPredictionScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [deviceId, setDeviceId] = useState('photon-001');
  const [loadingDays, setLoadingDays] = useState(false);
  const [availableDays, setAvailableDays] = useState([]); // ['2025-10-01', ...]
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [trainingSize, setTrainingSize] = useState('14'); // default 14 días
  const [predictCount, setPredictCount] = useState('7'); // default 7 días a predecir
  const [unit, setUnit] = useState('days'); // days | weeks | months
  const [running, setRunning] = useState(false);
  const [historySeries, setHistorySeries] = useState([]); // [{date, value}, ...]
  const [predSeries, setPredSeries] = useState([]); // [{date, value}, ...]

  // Helper: convierte ISO date string a YYYY-MM-DD
  const toDay = (iso) => new Date(iso).toISOString().slice(0,10);

  // Cargar días disponibles (extrae últimos 1000 registros y agrupa por día)
  const loadAvailableDays = async () => {
    if (!deviceId) return;
    setLoadingDays(true);
    try {
      const { data, error } = await supabase
        .from('ElectricalData')
        .select('timestamp, kWhA, kWhB, kWhC')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Supabase error', error);
        setAvailableDays([]);
        setLoadingDays(false);
        return;
      }

      // Agrupar por día y sumar kWh
      const map = new Map();
      (data || []).forEach((r) => {
        const day = toDay(r.timestamp);
        const sum = (r.kWhA || 0) + (r.kWhB || 0) + (r.kWhC || 0);
        map.set(day, (map.get(day) || 0) + sum);
      });

      // Orden ascendente por fecha
      const days = Array.from(map.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a,b) => new Date(a.date) - new Date(b.date));

      setAvailableDays(days);
      setSelectedDays(new Set()); // reset selección
    } catch (err) {
      console.error('Load days error', err);
    } finally {
      setLoadingDays(false);
    }
  };

  const toggleDay = (date) => {
    const next = new Set(selectedDays);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    setSelectedDays(next);
  };

  // Simple OLS linear regression (x as indices 0..n-1)
  const linearRegression = (xs, ys) => {
    const n = xs.length;
    if (n === 0) return { m: 0, b: 0 };
    const sumx = xs.reduce((s,c) => s + c, 0);
    const sumy = ys.reduce((s,c) => s + c, 0);
    const sumxy = xs.reduce((s,c,i) => s + c * ys[i], 0);
    const sumx2 = xs.reduce((s,c) => s + c * c, 0);
    const denom = n * sumx2 - sumx * sumx;
    const m = denom === 0 ? 0 : (n * sumxy - sumx * sumy) / denom;
    const b = (sumy - m * sumx) / n;
    return { m, b };
  };

  // Ejecutar predicción
  const runPrediction = async () => {
    if (!deviceId) {
      alert('Ingrese el deviceId');
      return;
    }

    setRunning(true);
    try {
      // Si el usuario seleccionó días, usamos esos; si no, usamos últimos N días según trainingSize
      let trainingPoints = [];
      if (selectedDays.size > 0) {
        const selected = Array.from(selectedDays).sort((a,b) => new Date(a) - new Date(b));
        // map selected to values from availableDays
        const lookup = new Map(availableDays.map(d => [d.date, d.value]));
        trainingPoints = selected.map(d => ({ date: d, value: lookup.get(d) || 0 }));
      } else {
        // usar últimos N días del availableDays
        const n = parseInt(trainingSize) || 14;
        const last = availableDays.slice(-n);
        trainingPoints = last;
      }

      if (!trainingPoints.length) {
        alert('No hay datos suficientes para entrenamiento. Primero carga los días disponibles.');
        setRunning(false);
        return;
      }

      // Construir xs, ys
      const xs = trainingPoints.map((_, idx) => idx);
      const ys = trainingPoints.map(p => parseFloat(p.value.toFixed ? p.value.toFixed(2) : p.value));

      // Ajuste lineal
      const { m, b } = linearRegression(xs, ys);

      // Generar predicciones para predictCount unidades (convertir según unit)
      const predN = parseInt(predictCount) || 7;
      // Si unit != days, convertir a days (weeks*7, months*30)
      const factor = unit === 'weeks' ? 7 : unit === 'months' ? 30 : 1;
      const totalPredDays = predN * factor;

      const lastIdx = xs.length - 1;
      const preds = [];
      const predsDates = [];
      for (let i = 1; i <= totalPredDays; i++) {
        const xi = lastIdx + i;
        const yhat = m * xi + b;
        // date = last training date + i days
        const lastDate = new Date(trainingPoints[trainingPoints.length - 1].date);
        const newDate = new Date(lastDate);
        newDate.setDate(newDate.getDate() + i);
        const dateStr = newDate.toISOString().slice(0,10);
        preds.push({ date: dateStr, value: Math.max(0, parseFloat(yhat.toFixed(2))) });
        predsDates.push(dateStr);
      }

      setHistorySeries(trainingPoints);
      setPredSeries(preds);
    } catch (err) {
      console.error('Prediction error', err);
      alert('Error ejecutando la predicción');
    } finally {
      setRunning(false);
    }
  };

  // Preparar datos para LineChart (alinear etiquetas)
  const prepareChartData = () => {
    const history = historySeries || [];
    const preds = predSeries || [];
    const labels = [...history.map(h => h.date), ...preds.map(p => p.date)];
    const histValues = [...history.map(h => h.value), ...preds.map(() => null)];
    const predValues = [...Array(history.length).fill(null), ...preds.map(p => p.value)];
    return { labels, histValues, predValues };
  };

  const chartDataObj = prepareChartData();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#93ab6bff', '#b7c586ff']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ML - Predicción (Regresión Lineal)</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>ID del dispositivo / edificio</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. photon-001"
            value={deviceId}
            onChangeText={setDeviceId}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Unidad</Text>
          <View style={styles.unitRow}>
            <TouchableOpacity onPress={() => setUnit('days')} style={[styles.unitBtn, unit === 'days' && styles.unitBtnActive]}>
              <Text style={[styles.unitText, unit === 'days' && styles.unitTextActive]}>Días</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUnit('weeks')} style={[styles.unitBtn, unit === 'weeks' && styles.unitBtnActive]}>
              <Text style={[styles.unitText, unit === 'weeks' && styles.unitTextActive]}>Semanas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUnit('months')} style={[styles.unitBtn, unit === 'months' && styles.unitBtnActive]}>
              <Text style={[styles.unitText, unit === 'months' && styles.unitTextActive]}>Meses</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Tamaño entrenamiento (n)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(trainingSize)}
                onChangeText={setTrainingSize}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Periodos a predecir</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(predictCount)}
                onChangeText={setPredictCount}
              />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <TouchableOpacity onPress={loadAvailableDays} style={styles.actionBtn}>
              {loadingDays ? <ActivityIndicator color="white" /> : <Text style={styles.actionText}>Cargar días disponibles</Text>}
            </TouchableOpacity>
          </View>

          {/* Lista de días (seleccionables) */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.smallTitle}>Días disponibles (selecciona los que quieras como entrenamiento)</Text>
            <ScrollView style={styles.daysList}>
              {availableDays.length === 0 && <Text style={styles.note}>No hay días cargados. Presiona "Cargar días disponibles".</Text>}
              {availableDays.map((d) => {
                const sel = selectedDays.has(d.date);
                return (
                  <TouchableOpacity key={d.date} onPress={() => toggleDay(d.date)} style={[styles.dayRow, sel && styles.dayRowActive]}>
                    <Text style={[styles.dayText, sel && styles.dayTextActive]}>{d.date} — {d.value.toFixed(1)} kWh</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={runPrediction} style={[styles.actionBtn, { marginTop: 12 }]} disabled={running}>
            {running ? <ActivityIndicator color="white" /> : <Text style={styles.actionText}>Predecir</Text>}
          </TouchableOpacity>
        </View>

        {/* Gráficas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resultados</Text>
          {chartDataObj.labels.length <= 1 ? (
            <Text style={styles.note}>Ejecuta una predicción para ver las gráficas.</Text>
          ) : (
            <>
              <Text style={styles.smallTitle}>Histórico vs Predicción (kWh)</Text>
              <LineChart
                data={{
                  labels: chartDataObj.labels.map(l => l.slice(5)), // MM-DD
                  datasets: [
                    { data: chartDataObj.histValues, color: () => '#3b82f6', strokeWidth: 2, withDots: true, },
                    { data: chartDataObj.predValues, color: () => '#059669', strokeWidth: 2, withDots: true, }
                  ],
                }}
                width={Math.min(1100, Math.max(320, (Platform.OS === 'web' ? 900 : 350)))} // responsive
                height={260}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(34,34,34,${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55,65,81,${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />

              {/* Barra de predicciones (solo predicción) */}
              <Text style={styles.smallTitle}>Predicción (kWh) — próximos días</Text>
              <BarChart
                data={{
                  labels: predSeries.map(p => p.date.slice(5)),
                  datasets: [{ data: predSeries.map(p => p.value) }],
                }}
                width={Math.min(1100, Math.max(320, (Platform.OS === 'web' ? 900 : 350)))}
                height={200}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(5,150,105, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55,65,81,${opacity})`,
                }}
                style={{ borderRadius: 12, marginTop: 8 }}
              />
            </>
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
  container: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  unitRow: { flexDirection: 'row', marginTop: 6 },
  unitBtn: { flex: 1, padding: 8, marginRight: 6, borderRadius: 8, backgroundColor: '#eef2e9', alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#93ab6b' },
  unitText: { color: '#374151', fontWeight: '600' },
  unitTextActive: { color: 'white' },
  row: { flexDirection: 'row', marginTop: 8 },
  actionBtn: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: 'white', fontWeight: 'bold' },
  daysList: { maxHeight: 160, marginTop: 8, borderRadius: 8 },
  dayRow: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dayRowActive: { backgroundColor: '#ecfdf5' },
  dayText: { color: '#374151' },
  dayTextActive: { color: '#065f46', fontWeight: '700' },
  smallTitle: { fontWeight: '700', color: '#374151', marginBottom: 8 },
  note: { color: '#6b7280', fontStyle: 'italic' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
});

export default MLPredictionScreen;