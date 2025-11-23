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
import { ImageBackground } from "react-native";
const mapImage = require("../../assets/MapConcept2.png");


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
    id: "photon-001", name: "Edificio Principal (A1)",code: "A1", position: { x: 540, y: 250 }, shape: "diamond", size: { w: 120, h: 120 },
  },
  {
    id: 1, name: "Aulas (A2)",code: "A2", position: { x: 820, y: 210 }, size: { w: 150, h: 46 },
  },
  {
    id: 2, name: "Aulas (A3)", code: "A3", position: { x: 820, y: 300 }, size: { w: 150, h: 46 },
  },
  {
    id: 3, name: "Laboratorio IC (LIC)", code: "LIC", position: { x: 510, y: 160 }, size: { w: 160, h: 46 },
  },
  {
    id: 4, name: "Dirección (D)", code: "D", position: { x: 460, y: 70 },size: { w: 180, h: 46 },
  },
  {
    id: 5, name: "Lab. M (LM)", code: "LM", position: { x: 140, y: 290 }, size: { w: 150, h: 60 },
  },
  {
    id: 6, name: "Lab. SE (LSE)", code: "LSE", position: { x: 160, y: 180 }, size: { w: 150, h: 60 },
  },
  {
    id: "b-lem", name: "Laboratorio de Electromecánica (LEM)", code: "LEM", position: { x: 300, y: 160 }, size: { w: 190, h: 46 },
  },
  {
    id: "b-le", name: "Laboratorio de Electrónica (LE)", code: "LE", position: { x: 430, y: 160 }, size: { w: 70, h: 46 },
  },
  {
    id: "b-liot", name: "Laboratorio IoT (LIOT)", code: "LIOT", position: { x: 650, y: 160 }, size: { w: 160, h: 46 },
  },
  {
    id: "b-se", name: "Sala de Equipos (SE)", code: "SE", position: { x: 350, y: 220 }, size: { w: 80, h: 56 }, borderOnly: true,
  }
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
            {/* Botón ML - accesible desde header */}
            <TouchableOpacity
              style={styles.mlButton}
              onPress={() => navigation.navigate('MLPredict')}
            >
              <Text style={styles.mlButtonText}>ML</Text>
            </TouchableOpacity>
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

            {/* 🔵 MAPA PNG INTERACTIVO (reemplaza GOOGLE MAPS) */}
            <View style={styles.mapBox}>
              <ImageBackground
                source={mapImage}
                style={StyleSheet.absoluteFill}
                imageStyle={{ resizeMode: "cover" }}
              >
                {/* 🔵 Hotspots interactivos encima del PNG */}
                {(buildingsData.length ? buildingsData : campusBuildingsConfig).map((b) => {
                  // posición en px (AJÚSTALAS con tu SVG para que coincidan)
                  const pos = b.position || { x: 0, y: 0 };
                  const size = b.size || { w: 80, h: 40 }; // ajustable

                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() =>
                        navigation.navigate("BuildingDashboard", {
                          buildingId: b.id,
                          buildingName: b.name,
                          buildingData: b,
                        })
                      }
                      activeOpacity={0.85}
                      style={{
                        position: "absolute",
                        left: pos.x,
                        top: pos.y,
                        width: size.w,
                        height: size.h,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 6,

                        // color del estado del edificio
                        backgroundColor: `${b.color || "#6b7280"}55`,
                        borderWidth: 2,
                        borderColor: "#00000055",
                      }}
                    >
                      <Text style={{ fontWeight: "800", color: "#fff", fontSize: 14 }}>
                        {b.code}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 10,
                          color: "#e2e8f0",
                          marginTop: 2,
                        }}
                      >
                        {(b.consumption || 0).toFixed(1)} kWh
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ImageBackground>
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

  /* Botón ML (liquid glass look) */
  mlButton: {
    backgroundColor: "rgba(16,185,129,0.14)",
    width: 44,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(5,150,105,0.18)",
    shadowColor: "#064e3b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mlButtonText: {
    color: "#059669",
    fontWeight: "bold",
    fontSize: 16,
  },

  infoButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { fontSize: 20, color: "white" },
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
  mapBox: {
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

  /* Andadores */
  walkway: {
    position: "absolute",
    width: 18,
    backgroundColor: "#aeb4b9",
    borderRadius: 6,
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