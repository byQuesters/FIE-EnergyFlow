import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchLatestData } from "../data/energy_data";

const CENTER = { latitude: 19.12389719954498, longitude: -104.40016595163002 };

// Zoom aproximado para cubrir ÚNICAMENTE el área del diagrama (≈ 280–320 m).
const INITIAL_REGION = {
  ...CENTER,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

// Límite “soft” para que el usuario no se salga del encuadre del plano
const BOUNDS = {
  north: CENTER.latitude + 0.0013,
  south: CENTER.latitude - 0.0013,
  east: CENTER.longitude + 0.0013,
  west: CENTER.longitude - 0.0013,
};

// Ayuda para offsets pequeños desde el centro (grados)
const o = (dLat, dLng) => ({
  latitude: CENTER.latitude + dLat,
  longitude: CENTER.longitude + dLng,
});

// Solo edificios del diagrama con coordenadas aproximadas (ajústalas en sitio si lo deseas)
const campusSensorsConfig = [
  {
    id: "b-ce",
    name: "Centro de Estudios (CE)",
    code: "CE",
    coord: o(0.0009, -0.0009),
  },
  { id: "b-d", name: "D", code: "D", coord: o(0.00055, 0.0001) },
  {
    id: "b-lem",
    name: "Laboratorio de Electromecánica (LEM)",
    code: "LEM",
    coord: o(0.0001, -0.00035),
  },
  {
    id: "b-le",
    name: "Laboratorio de Electrónica (LE)",
    code: "LE",
    coord: o(0.0001, -0.00008),
  },
  {
    id: "b-lic",
    name: "Laboratorios (LIC)",
    code: "LIC",
    coord: o(0.0001, 0.0002),
  },
  {
    id: "b-liot",
    name: "Laboratorio IoT (LIOT)",
    code: "LIOT",
    coord: o(0.0001, 0.00047),
  },
  {
    id: "b-fcamN",
    name: "FCAM (Norte)",
    code: "FCAM",
    coord: o(0.00075, 0.0009),
  },
  {
    id: "b-fcamE",
    name: "FCAM (Este)",
    code: "FCAM",
    coord: o(0.00025, 0.00095),
  },
  { id: "b-lse", name: "LSE", code: "LSE", coord: o(0.00005, -0.00075) },
  { id: "b-lm", name: "LM", code: "LM", coord: o(-0.00055, -0.00078) },
  {
    id: "b-se",
    name: "Sala de Equipos (SE)",
    code: "SE",
    coord: o(-0.0001, -0.00018),
  },
  {
    id: "photon-001",
    name: "Edificio Principal (A1)",
    code: "A1",
    coord: o(-0.00015, 0.00018),
  },
  {
    id: "b-a2",
    name: "Administración (A2)",
    code: "A2",
    coord: o(0.0001, 0.00065),
  },
  { id: "b-a3", name: "Aulas (A3)", code: "A3", coord: o(-0.00035, 0.00065) },
];

// Colores por estado del sensor
const statusColor = (s) =>
  s === "low"
    ? "#3b82f6"
    : s === "normal"
      ? "#10b981"
      : s === "high"
        ? "#f59e0b"
        : s === "critical"
          ? "#ef4444"
          : "#6b7280";

const statusText = (s) =>
  s === "low"
    ? "Bajo"
    : s === "normal"
      ? "Normal"
      : s === "high"
        ? "Alto"
        : s === "critical"
          ? "Crítico"
          : "Desconocido";

const CampusMapScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [sensors, setSensors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Carga periódica de estado/consumo por sensor (MISMA lógica que antes)
  const updateSensors = async () => {
    const items = await Promise.all(
      campusSensorsConfig.map(async (s) => {
        const data = await fetchLatestData(s.id);
        return {
          ...s,
          consumption: data ? data.consumption : 0,
          status: data ? data.status : "unknown",
          color: statusColor(data ? data.status : "unknown"),
          realTimeData: data ? data.realTimeData : null,
        };
      }),
    );
    setSensors(items);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    updateSensors();
    const t = setInterval(updateSensors, 10000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    updateSensors();
    setTimeout(() => setRefreshing(false), 800);
  };

  const navigateToDashboard = (b) => {
    navigation.navigate("BuildingDashboard", {
      buildingId: b.id,
      buildingName: b.name,
      buildingData: b,
    });
  };

  const totalKwh = useMemo(
    () => sensors.reduce((acc, s) => acc + (s.consumption || 0), 0).toFixed(1),
    [sensors],
  );

  const showInfo = () =>
    Alert.alert(
      "Monitoreo Energético",
      `Edificios: ${sensors.length}\nConsumo total: ${totalKwh} kWh\nÚltima actualización: ${lastUpdate.toLocaleString()}`,
      [{ text: "OK" }],
    );

  // Evitar que el usuario se salga del recuadro del plano
  const clampToBounds = (region) => {
    const lat = Math.min(Math.max(region.latitude, BOUNDS.south), BOUNDS.north);
    const lng = Math.min(Math.max(region.longitude, BOUNDS.west), BOUNDS.east);
    if (lat !== region.latitude || lng !== region.longitude) {
      mapRef.current?.animateToRegion(
        { ...region, latitude: lat, longitude: lng },
        120,
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#93ab6bff", "#b7c586ff"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ENERGY FLOW</Text>
            <Text style={styles.headerSubtitle}>
              Vista satelital (Google Maps)
            </Text>
          </View>
          <TouchableOpacity style={styles.infoBtn} onPress={showInfo}>
            <Text style={styles.infoTxt}>i</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f8fafcee" }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Consumo total</Text>
          <Text style={styles.summaryValue}>{totalKwh} kWh</Text>
          <Text style={styles.summaryHint}>
            Área acotada al plano · {sensors.length} sensores
          </Text>
        </View>

        {/* GOOGLE MAPS — solo marcadores (sensores) sobre la imagen satelital */}
        <View style={styles.mapBox}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            mapType="satellite" // 🔴 imagen satelital real
            initialRegion={INITIAL_REGION}
            onRegionChangeComplete={clampToBounds}
            showsPointsOfInterest={false}
            showsTraffic={false}
            showsCompass={false}
            toolbarEnabled={false}
          >
            {sensors.map((b) => (
              <Marker
                key={b.id}
                coordinate={b.coord}
                onPress={() => navigateToDashboard(b)}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 1 }}
              >
                {/* Pin compacto de estado + etiqueta */}
                <View style={styles.pinWrap}>
                  <View
                    style={[
                      styles.pinDot,
                      { backgroundColor: statusColor(b.status) },
                    ]}
                  />
                  <View style={styles.pinCard}>
                    <Text style={styles.pinTitle}>{b.code}</Text>
                    <Text style={styles.pinMeta}>
                      {statusText(b.status)} · {(b.consumption || 0).toFixed(1)}{" "}
                      kWh
                    </Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Lista (igual que antes, solo datos) */}
        <View style={styles.listBox}>
          <Text style={styles.listTitle}>Sensores del área</Text>
          {sensors.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.row}
              onPress={() => navigateToDashboard(b)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{b.name}</Text>
                <Text style={styles.rowMeta}>
                  {(b.consumption || 0).toFixed(1)} kWh · {statusText(b.status)}
                </Text>
              </View>
              <View
                style={[
                  styles.rowDot,
                  { backgroundColor: statusColor(b.status) },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: insets.bottom || 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#93ab6bff" },

  header: { paddingTop: 18, paddingBottom: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    marginTop: 2,
    fontSize: 13,
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTxt: { color: "#fff", fontSize: 18, fontWeight: "800" },

  summary: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#7a4fc8",
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "600",
  },

  mapBox: {
    height: 480,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  // Pin/marker visual
  pinWrap: { alignItems: "center" },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#0f172a",
    marginBottom: 6,
  },
  pinCard: {
    backgroundColor: "rgba(15,23,42,0.9)",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 68,
  },
  pinTitle: {
    color: "#e5edff",
    fontWeight: "900",
    fontSize: 12,
    textAlign: "center",
  },
  pinMeta: {
    color: "#cbd5e1",
    fontWeight: "700",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },

  listBox: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
  },
  listTitle: { fontWeight: "800", color: "#111827", marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowTitle: { fontWeight: "800", color: "#111827" },
  rowMeta: { color: "#6b7280", fontWeight: "700", fontSize: 12, marginTop: 2 },
  rowDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 10 },
});

export default CampusMapScreen;
