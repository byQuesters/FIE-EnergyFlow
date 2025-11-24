import React, { useState, useEffect, useRef } from "react";
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
  StatusBar, 
  Animated,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; 
import { fetchLatestData } from "../data/energy_data";
import { authService } from "../../lib/auth";

import { ImageBackground } from "react-native";
const mapImage = require("../../assets/MapConcept2.png");
const { width } = Dimensions.get("window");

// Tamaño del PNG usado como base para el panning, si la reslución del PNG cambia, tambíen debe cambiase aquí
const MAP_WIDTH = 1450; 
const MAP_HEIGHT = 712;
/* ------------------------------------------------------------------------- */
/* Configuración de edificios del campus */
/* ------------------------------------------------------------------------- */
const campusBuildingsConfig = [
  // Ids originales (conservados)
  {
    id: "photon-001", name: "Edificio Principal (A1)",code: "A1", position: { x: 640, y: 390 }, shape: "diamond", size: { w: 120, h: 120 },
  },
  {
    id: 1, name: "Aulas (A2)",code: "A2", position: { x: 908, y: 390}, size: { w: 200, h: 75 },
  },
  {
    id: 2, name: "Aulas (A3)", code: "A3", position: { x: 960, y: 513 }, size: { w: 130, h: 70 },
  },
  {
    id: 3, name: "Laboratorio IC (LIC)", code: "LIC", position: { x: 760, y: 258 }, size: { w: 95, h: 75 },
  },
  {
    id: 4, name: "Dirección (D)", code: "D", position: { x: 580, y: 115 },size: { w: 210, h: 73 },
  },
  {
    id: 5, name: "Lab. M (LM)", code: "LM", position: { x: 160, y: 390 }, size: { w: 205, h: 105 },
  },
  {
    id: 6, name: "Lab. SE (LSE)", code: "LSE", position: { x: 190, y: 260 }, size: { w: 180, h: 70 },
  },
  {
    id: "b-lem", name: "Laboratorio de Electromecánica (LEM)", code: "LEM", position: { x: 440, y: 257 }, size: { w: 100, h: 75 },
  },
  {
    id: "b-le", name: "Laboratorio de Electrónica (LE)", code: "LE", position: { x: 540, y: 257 }, size: { w: 100, h: 75 },
  },
  {
    id: "b-liot", name: "Laboratorio IoT (LIOT)", code: "LIOT", position: { x: 854, y: 258 }, size: { w: 73, h: 75 },
  },
  {
    id: "b-se", name: "Sala de Equipos (SE)", code: "SE", position: { x: 470, y: 340 }, size: { w: 80, h: 60 }, borderOnly: true,
  }
];

const CampusMapScreen = ({ navigation }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingsData, setBuildingsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [settingsVisible, setSettingsVisible] = useState(false);

  const insets = useSafeAreaInsets();

  // Panning state for map navigation
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: width - 40, h: 400 });

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: lastOffset.current.x, y: lastOffset.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        // compute clamped absolute position
        let newX = lastOffset.current.x + gesture.dx;
        let newY = lastOffset.current.y + gesture.dy;
        const minX = Math.min(0, containerSize.w - MAP_WIDTH);
        const maxX = 0;
        const minY = Math.min(0, containerSize.h - MAP_HEIGHT);
        const maxY = 0;
        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);
        // set relative values (because offset is set)
        pan.x.setValue(newX - lastOffset.current.x);
        pan.y.setValue(newY - lastOffset.current.y);
      },
      onPanResponderRelease: (e, gesture) => {
        let newX = lastOffset.current.x + gesture.dx;
        let newY = lastOffset.current.y + gesture.dy;
        const minX = Math.min(0, containerSize.w - MAP_WIDTH);
        const maxX = 0;
        const minY = Math.min(0, containerSize.h - MAP_HEIGHT);
        const maxY = 0;
        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);
        pan.setOffset({ x: newX, y: newY });
        pan.setValue({ x: 0, y: 0 });
        lastOffset.current.x = newX;
        lastOffset.current.y = newY;
      },
    }),
  ).current;

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isUserAuthenticated();
      if (!isAuth) navigation.replace("Auth");
    };
    checkAuth();
  }, [navigation]);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        await authService.logout();
        navigation.replace("Auth");
      }
    } else {
      Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar", style: "destructive", onPress: async () => { await authService.logout(); navigation.replace("Auth"); } }
      ]);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "low": return "#3b82f6";
      case "normal": return "#10b981";
      case "high": return "#f59e0b";
      case "critical": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "low": return "Bajo";
      case "normal": return "Normal";
      case "high": return "Alto";
      case "critical": return "Crítico";
      default: return "Desconocido";
    }
  };

  const getTotalConsumption = () => {
    return buildingsData.reduce((total, building) => total + building.consumption, 0).toFixed(1);
  };

  /* ------------------------------- RENDER -------------------------------- */

  return (
    // CORRECCIÓN 1: Quitamos paddingTop del container principal
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Modal de Configuración */}
      <SettingsModal 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        systemInfo={{
          buildingCount: buildingsData.length,
          totalConsumption: getTotalConsumption(),
          lastUpdate: lastUpdate.toLocaleString()
        }}
      />

      {/* CORRECCIÓN 2: Header incluye el paddingTop para cubrir la barra de estado */}
      <LinearGradient 
        colors={colors.headerGradient} 
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>ENERGY FLOW</Text>
            <Text style={styles.headerSubtitle}>
              Sistema de Monitoreo Energético
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.mlButton}
              onPress={() => navigation.navigate('MLPredict')}
            >
              <Text style={styles.mlButtonText}>ML</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSettingsVisible(true)}
              style={styles.infoButton}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
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
        style={[styles.content, { backgroundColor: colors.background }]} 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Resumen */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Consumo Total del Campus</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{getTotalConsumption()} kWh</Text>
          <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
            {buildingsData.length} edificios monitoreados
          </Text>
        </View>

        {/* Mapa FIE */}
        <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.mapTitle, { color: colors.text }]}>Mapa del Campus</Text>

            {/* 🔵 MAPA PNG INTERACTIVO (reemplaza GOOGLE MAPS) */}
            <View
              style={styles.mapBox}
              onLayout={(e) =>
                setContainerSize({
                  w: e.nativeEvent.layout.width,
                  h: e.nativeEvent.layout.height,
                })
              }
            >
              <View style={{ flex: 1, overflow: "hidden" }}>
                <Animated.View
                  {...panResponder.panHandlers}
                  style={{
                    width: MAP_WIDTH,
                    height: MAP_HEIGHT,
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                  }}
                >
                  <ImageBackground
                    source={mapImage}
                    style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
                    imageStyle={{ resizeMode: "cover" }}
                  >
                    {/* 🔵 Hotspots interactivos encima del PNG (se mueven con la imagen) */}
                    {(buildingsData.length ? buildingsData : campusBuildingsConfig).map((b) => {
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
                </Animated.View>
              </View>
            </View>

        </View>

        {/* LISTA DE EDIFICIOS */}
        <View style={[styles.buildingsListContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.buildingsListTitle, { color: colors.text }]}>Edificios del Campus</Text>
          {buildingsData.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={[styles.buildingCard, { backgroundColor: theme.dark ? colors.background : '#f8fafc', borderColor: colors.border }]}
              onPress={() => handleBuildingPress(building)}
            >
              <View style={styles.buildingCardContent}>
                <View style={styles.buildingCardLeft}>
                  <Text style={[styles.buildingCardName, { color: colors.text }]}>{building.name}</Text>
                  <Text style={[styles.buildingCardConsumption, { color: colors.textSecondary }]}>
                    {building.consumption} kWh
                  </Text>
                  <Text style={[styles.buildingCardTime, { color: colors.textSecondary }]}>
                    Actualizado:{" "}
                    {new Date(building.realTimeData?.timestamp || Date.now()).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.buildingCardRight}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(building.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(building.status) }]}>
                    {getStatusText(building.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: insets.bottom || 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#93ab6bff", 
    ...(Platform.OS === "web" && { minHeight: "100vh" }),
  },
  // paddingTop se maneja dinámicamente, paddingBottom fijo
  header: { paddingBottom: 15 },
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
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
  logoutButtonText: { fontSize: 20 },
  content: { flex: 1 },
  
  summaryContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ab70c1ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 32, fontWeight: "bold" },
  summarySubtitle: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "bold",
  },

  mapContainer: {
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
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  mapBox: {
    height: 620,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapBackground: {
    flex: 1,
    position: "relative",
  },
  mapBorder: {
    position: "absolute",
    left: 8, top: 8, right: 8, bottom: 8,
    borderWidth: 2,
    borderColor: "#2a2a2a55",
  },
  roadVertical: {
    position: "absolute",
    right: 40, top: 20, bottom: 20,
    width: 38,
    backgroundColor: "#2e3033",
    borderRadius: 16,
  },
  roadHorizontal: {
    position: "absolute",
    left: 200, right: 160, bottom: 120,
    height: 28,
    backgroundColor: "#2e3033",
    borderRadius: 14,
  },
  roadVCenter: {
    position: "absolute",
    right: 58, top: 28, bottom: 28,
    width: 2,
    borderStyle: "dashed",
    borderRightWidth: 2,
    borderColor: "#ffd24a",
  },
  roadHCenter: {
    position: "absolute",
    left: 210, right: 170, bottom: 133,
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
  parking: {
    position: "absolute",
    left: 420, bottom: 70,
    width: 190, height: 80,
    backgroundColor: "#262a2f",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  parkingSlots: {
    width: "86%", height: "74%",
    borderWidth: 2,
    borderColor: "#3c434a",
    backgroundColor: "#30363c",
  },
  courts: {
    position: "absolute",
    right: 40, bottom: 40,
    width: 210, height: 110,
    backgroundColor: "#f6a65b",
    borderWidth: 3,
    borderColor: "#e48f38",
  },
  courtLine: {
    position: "absolute",
    left: "50%", top: 0, bottom: 0,
    width: 6,
    backgroundColor: "#ffcc7a",
  },
  tree: {
    position: "absolute",
    width: 28, height: 28,
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
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#831313",
  },
  buildingsListContainer: {
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
  },
  buildingsListTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  buildingCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  buildingCardConsumption: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buildingCardTime: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  buildingCardRight: { alignItems: "center" },
  statusIndicator: {
    width: 12, height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },
});

export default CampusMapScreen;