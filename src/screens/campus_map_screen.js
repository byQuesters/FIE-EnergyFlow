import React, { useState, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchLatestData } from "../data/energy_data";
import { authService } from "../../lib/auth";

const { width } = Dimensions.get("window");

/* ------------------------------------------------------------------------- */
/* Configuración de edificios del campus (un sensor = un edificio)
   Mantengo los ids existentes y agrego otros para cubrir el mapa FIE. 
   name: etiqueta visible completa en tarjetas
   code: etiqueta corta usada sobre el edificio (A1, LSE, etc.)
   position: coordenadas relativas dentro del contenedor del mapa (px)
   shape: 'rect' | 'diamond' para aproximar A1 del plano
/* ------------------------------------------------------------------------- */
const campusBuildingsConfig = [
  // Ids originales (conservados)
  {
    id: "photon-001",
    name: "Edificio Principal (A1)",
    code: "A1",
    position: { x: 540, y: 250 },
    shape: "diamond",
    size: { w: 120, h: 120 },
  },
  {
    id: 1,
    name: "Administración (A2)",
    code: "A2",
    position: { x: 820, y: 210 },
    size: { w: 150, h: 46 },
  },
  {
    id: 2,
    name: "Aulas (A3)",
    code: "A3",
    position: { x: 820, y: 300 },
    size: { w: 150, h: 46 },
  },
  {
    id: 3,
    name: "Laboratorios (LIC)",
    code: "LIC",
    position: { x: 510, y: 160 },
    size: { w: 160, h: 46 },
  },
  {
    id: 4,
    name: "Biblioteca (D)",
    code: "D",
    position: { x: 460, y: 70 },
    size: { w: 180, h: 46 },
  },
  {
    id: 5,
    name: "Cafetería (LM)",
    code: "LM",
    position: { x: 140, y: 290 },
    size: { w: 150, h: 60 },
  },
  {
    id: 6,
    name: "Gimnasio (LSE)",
    code: "LSE",
    position: { x: 160, y: 180 },
    size: { w: 150, h: 60 },
  },

  // Nuevos (para replicar el plano FIE)
  {
    id: "b-lem",
    name: "Laboratorio de Electromecánica (LEM)",
    code: "LEM",
    position: { x: 300, y: 160 },
    size: { w: 190, h: 46 },
  },
  {
    id: "b-le",
    name: "Laboratorio de Electrónica (LE)",
    code: "LE",
    position: { x: 430, y: 160 },
    size: { w: 70, h: 46 },
  },
  {
    id: "b-liot",
    name: "Laboratorio IoT (LIOT)",
    code: "LIOT",
    position: { x: 650, y: 160 },
    size: { w: 160, h: 46 },
  },
  {
    id: "b-se",
    name: "Sala de Equipos (SE)",
    code: "SE",
    position: { x: 350, y: 220 },
    size: { w: 80, h: 56 },
    borderOnly: true,
  },
  {
    id: "b-fcam-n",
    name: "FCAM (Norte)",
    code: "FCAM",
    position: { x: 760, y: 70 },
    size: { w: 160, h: 70 },
    light: true,
  },
  {
    id: "b-fcam-e",
    name: "FCAM (Este)",
    code: "FCAM",
    position: { x: 860, y: 150 },
    size: { w: 160, h: 60 },
    light: true,
  },
  {
    id: "b-ce",
    name: "Centro de Estudios (CE)",
    code: "CE",
    position: { x: 90, y: 60 },
    size: { w: 130, h: 70 },
    light: true,
  },
];

/* ------------------------------------------------------------------------- */

const CampusMapScreen = ({ navigation }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingsData, setBuildingsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const insets = useSafeAreaInsets();

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isUserAuthenticated();
      if (!isAuth) {
        // Si no hay sesión, redirigir al login
        navigation.replace("Auth");
      }
    };
    checkAuth();
  }, [navigation]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    // Usar confirm nativo de JavaScript para compatibilidad con web
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "¿Estás seguro de que quieres cerrar sesión?",
      );
      if (confirmed) {
        await authService.logout();
        navigation.replace("Auth");
      }
    } else {
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que quieres cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Cerrar Sesión",
            style: "destructive",
            onPress: async () => {
              await authService.logout();
              navigation.replace("Auth");
            },
          },
        ],
      );
    }
  };

  // Función para actualizar datos de todos los edificios (SIN CAMBIOS)
  const updateBuildingsData = async () => {
    const updatedBuildings = await Promise.all(
      campusBuildingsConfig.map(async (building) => {
        const data = await fetchLatestData(building.id);
        return {
          ...building,
          consumption: data ? data.consumption : 0,
          status: data ? data.status : "unknown",
          color: getStatusColor(data ? data.status : "unknown"),
          realTimeData: data ? data.realTimeData : null,
        };
      }),
    );
    setBuildingsData(updatedBuildings);
    setLastUpdate(new Date());
  };

  // Actualizar datos cada 10 segundos (SIN CAMBIOS)
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
    navigation.navigate("BuildingDashboard", {
      buildingId: building.id,
      buildingName: building.name,
      buildingData: building,
    });
  };

  // Info del sistema (SIN CAMBIOS)
  const showSystemInfo = () => {
    Alert.alert(
      "Sistema de Monitoreo Energético",
      `Panel de Administración\n\nMonitoreando ${buildingsData.length} edificios\nConsumo total: ${getTotalConsumption()} kWh\nÚltima actualización: ${lastUpdate.toLocaleString()}`,
      [{ text: "OK" }],
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "low":
        return "#3b82f6";
      case "normal":
        return "#10b981";
      case "high":
        return "#f59e0b";
      case "critical":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "low":
        return "Bajo";
      case "normal":
        return "Normal";
      case "high":
        return "Alto";
      case "critical":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  const getTotalConsumption = () => {
    return buildingsData
      .reduce((total, building) => total + building.consumption, 0)
      .toFixed(1);
  };

  /* ------------------------------- RENDER -------------------------------- */

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#93ab6bff", "#b7c586ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>ENERGY FLOW</Text>
            <Text style={styles.headerSubtitle}>
              Sistema de Monitoreo Energético
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={showSystemInfo}
              style={styles.infoButton}
            >
              <Text style={styles.infoText}>i</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor={"#3b82f6"}
          />
        }
      >
        {/* Resumen (SIN CAMBIOS de funcionalidad) */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Consumo Total del Campus</Text>
          <Text style={styles.summaryValue}>{getTotalConsumption()} kWh</Text>
          <Text style={styles.summarySubtitle}>
            {buildingsData.length} edificios monitoreados
          </Text>
        </View>

        {/* Mapa FIE (solo estilos/posiciones) */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Mapa del Campus</Text>

          <View style={styles.mapView}>
            {/* Fondo tipo césped */}
            <View style={styles.mapBackground}>
              <LinearGradient
                colors={["#dff0c7", "#cfe6ae", "#e6f5d2"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Marcos / orilla */}
              <View style={styles.mapBorder} />

              {/* Calles principales */}
              <View style={styles.roadVertical} />
              <View style={styles.roadHorizontal} />
              {/* Líneas amarillas discontinuas */}
              <View style={styles.roadVCenter} />
              <View style={styles.roadHCenter} />

              {/* Andadores grises más claros */}
              <View
                style={[styles.walkway, { left: 110, top: 100, height: 210 }]}
              />
              <View
                style={[
                  styles.walkway,
                  { left: 580, top: 120, width: 14, height: 130 },
                ]}
              />
              <View
                style={[
                  styles.walkway,
                  { left: 740, top: 90, width: 16, height: 240 },
                ]}
              />

              {/* Estacionamiento (abajo-centro) */}
              <View style={styles.parking}>
                <View style={styles.parkingSlots} />
              </View>

              {/* Canchas (abajo-derecha) */}
              <View style={styles.courts}>
                <View style={styles.courtLine} />
              </View>

              {/* “Arbolitos” (ornamentales) */}
              {[
                { x: 90, y: 130 },
                { x: 250, y: 70 },
                { x: 300, y: 250 },
                { x: 620, y: 260 },
                { x: 720, y: 330 },
                { x: 900, y: 90 },
                { x: 120, y: 360 },
                { x: 520, y: 340 },
                { x: 250, y: 340 },
              ].map((p, idx) => (
                <View
                  key={`tree-${idx}`}
                  style={[styles.tree, { left: p.x, top: p.y }]}
                />
              ))}

              {/* Render de edificios */}
              {buildingsData.map((b) => {
                const w = b.size?.w ?? 160;
                const h = b.size?.h ?? 46;
                const isDiamond = b.shape === "diamond";
                const borderOnly = b.borderOnly;
                const light = b.light;

                // Estilo base de “rectángulo azul”
                const baseStyle = [
                  styles.building,
                  {
                    left: b.position.x,
                    top: b.position.y,
                    width: w,
                    height: h,
                    backgroundColor: borderOnly
                      ? "transparent"
                      : light
                        ? "#8db8d6"
                        : "#0f2d55",
                    borderColor: borderOnly ? "#c63" : "#082743",
                    borderWidth: borderOnly ? 3 : 3,
                  },
                ];

                // Diamante (A1)
                const diamondStyle = [
                  styles.buildingDiamond,
                  {
                    left: (b.position.x || 0) + (w / 2 - h / 2),
                    top: (b.position.y || 0) - (w / 2 - h / 2),
                    width: h + 20,
                    height: h + 20,
                    backgroundColor: "#0f2d55",
                    borderColor: "#082743",
                    borderWidth: 3,
                  },
                ];

                return (
                  <TouchableOpacity
                    key={b.id}
                    activeOpacity={0.9}
                    onPress={() => handleBuildingPress(b)}
                    style={isDiamond ? diamondStyle : baseStyle}
                  >
                    {/* Sensor rojo (punto) */}
                    <View
                      style={[
                        styles.sensorDot,
                        {
                          backgroundColor:
                            b.status === "critical" ? "#ef4444" : "#ef4444", // siempre rojo, como en el plano
                          top: isDiamond ? -10 : -10,
                          left: isDiamond ? (h + 20) / 2 - 6 : w / 2 - 6,
                        },
                      ]}
                    />

                    {/* Etiqueta del edificio en el mapa */}
                    <Text
                      style={[
                        styles.buildingLabel,
                        light && { color: "#05243d" },
                        borderOnly && { color: "#05243d" },
                        isDiamond && { transform: [{ rotate: "90deg" }] }, // texto vertical similar a A1 rotado
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {b.code || b.name}
                    </Text>

                    {/* Consumo (se muestra pequeño bajo el código) */}
                    {!isDiamond && (
                      <Text style={styles.buildingConsumption}>
                        {b.consumption} kWh
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Lista de edificios (SIN CAMBIOS de funcionalidad) */}
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
                    Actualizado:{" "}
                    {new Date(
                      building.realTimeData?.timestamp || Date.now(),
                    ).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.buildingCardRight}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(building.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(building.status) },
                    ]}
                  >
                    {getStatusText(building.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Padding inferior para barra de gestos */}
        <View style={{ height: insets.bottom || 20 }} />
      </ScrollView>
    </View>
  );
};

/* --------------------------------- STYLES -------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#93ab6bff",
    ...(Platform.OS === "web" && { minHeight: "100vh" }),
  },
  header: { paddingTop: 20, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: { flex: 1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "white" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    fontWeight: "bold",
  },
  infoButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginLeft: 10,
  },
  logoutButtonText: {
    fontSize: 20,
  },
  infoText: { fontSize: 20, color: "white" },
  content: { flex: 1, backgroundColor: "#f8fafcee" },

  /* Tarjeta resumen */
  summaryContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ab70c1ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ab70c133",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 32, fontWeight: "bold", color: "#ab70c1ff" },
  summarySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
    fontWeight: "bold",
  },

  /* Contenedor del mapa */
  mapContainer: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#00000030",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 15,
    textAlign: "center",
  },
  mapView: {
    height: 480,
    borderRadius: 10,
    overflow: "hidden",
  },
  mapBackground: {
    flex: 1,
    position: "relative",
    backgroundColor: "#dff0c7",
  },
  mapBorder: {
    position: "absolute",
    left: 8,
    top: 8,
    right: 8,
    bottom: 8,
    borderWidth: 2,
    borderColor: "#2a2a2a55",
  },

  /* Calles principales */
  roadVertical: {
    position: "absolute",
    right: 40,
    top: 20,
    bottom: 20,
    width: 38,
    backgroundColor: "#2e3033",
    borderRadius: 16,
  },
  roadHorizontal: {
    position: "absolute",
    left: 200,
    right: 160,
    bottom: 120,
    height: 28,
    backgroundColor: "#2e3033",
    borderRadius: 14,
  },
  roadVCenter: {
    position: "absolute",
    right: 58,
    top: 28,
    bottom: 28,
    width: 2,
    borderStyle: "dashed",
    borderRightWidth: 2,
    borderColor: "#ffd24a",
  },
  roadHCenter: {
    position: "absolute",
    left: 210,
    right: 170,
    bottom: 133,
    height: 2,
    borderStyle: "dashed",
    borderTopWidth: 2,
    borderColor: "#ffd24a",
  },

  /* Andadores */
  walkway: {
    position: "absolute",
    width: 18,
    backgroundColor: "#aeb4b9",
    borderRadius: 6,
  },

  /* Estacionamiento */
  parking: {
    position: "absolute",
    left: 420,
    bottom: 70,
    width: 190,
    height: 80,
    backgroundColor: "#262a2f",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  parkingSlots: {
    width: "86%",
    height: "74%",
    borderWidth: 2,
    borderColor: "#3c434a",
    backgroundColor: "#30363c",
  },

  /* Canchas */
  courts: {
    position: "absolute",
    right: 40,
    bottom: 40,
    width: 210,
    height: 110,
    backgroundColor: "#f6a65b",
    borderWidth: 3,
    borderColor: "#e48f38",
  },
  courtLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: "#ffcc7a",
  },

  /* Árboles */
  tree: {
    position: "absolute",
    width: 28,
    height: 28,
    backgroundColor: "#3e7c3e",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#245a2c",
    opacity: 0.9,
  },

  /* Edificios */
  building: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
  buildingDiamond: {
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
  buildingLabel: {
    color: "#e6eefc",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
  buildingConsumption: {
    color: "#cdd8ea",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  sensorDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#831313",
  },

  /* Lista inferior */
  buildingsListContainer: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#00000030",
  },
  buildingsListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 15,
  },
  buildingCard: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#00000030",
  },
  buildingCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buildingCardLeft: { flex: 1 },
  buildingCardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  buildingCardConsumption: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "bold",
  },
  buildingCardTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    fontWeight: "bold",
  },
  buildingCardRight: { alignItems: "center" },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },
});
export default CampusMapScreen;
