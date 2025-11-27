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
  Animated,
  PanResponder,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImageBackground } from "react-native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons"; // Importar iconos

import { fetchLatestData } from "../data/energy_data";
import { authService } from "../../lib/auth";
import { useTheme } from "../contexts/ThemeContext"; // Importar Tema
import SettingsModal from "../components/SettingsModal"; // Importar Modal

const mapImage = require("../../assets/MapConcept2.png");
const { width } = Dimensions.get("window");

// Tamaño del PNG original
const MAP_WIDTH = 1450;  
const MAP_HEIGHT = 712;

/* Configuración de edificios */
const campusBuildingsConfig = [
  {
    id: "AULA1", name: "Edificio Principal (A1)",code: "A1", position: { x: 621, y: 368 }, shape: "hex", size: { w: 174, h: 154 },
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
    id: "photon-001", name: "Laboratorio IoT (LIOT)", code: "LIOT", position: { x: 854, y: 258 }, size: { w: 73, h: 75 },
  },
  {
    id: "b-se", name: "Sala de Equipos (SE)", code: "SE", position: { x: 470, y: 340 }, size: { w: 80, h: 60 }, borderOnly: true,
  }
];

/* ------------------------------------------------------------------------- */
const CampusMapScreen = ({ navigation }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingsData, setBuildingsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [settingsVisible, setSettingsVisible] = useState(false); // Estado para el modal

  const insets = useSafeAreaInsets();
  
  // Hooks del Tema
  const { theme } = useTheme();
  const { colors } = theme;

  // Panning state
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: width - 40, h: 620 });
  const containerSizeRef = useRef(containerSize);

  const initialScale = Math.max(
    (containerSize.w || (width - 40)) / MAP_WIDTH,
    (containerSize.h || 620) / MAP_HEIGHT,
  );
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(scale);
  const [scaledSize, setScaledSize] = useState({ w: MAP_WIDTH * scale, h: MAP_HEIGHT * scale });
  const scaledSizeRef = useRef(scaledSize);

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const centerMap = () => {
    const cs = containerSizeRef.current;
    const ss = scaledSizeRef.current;
    if (!cs || !ss) return;
    const desiredX = clamp((cs.w - ss.w) / 2, Math.min(0, cs.w - ss.w), 0);
    const desiredY = clamp((cs.h - ss.h) / 2, Math.min(0, cs.h - ss.h), 0);
    lastOffset.current.x = desiredX;
    lastOffset.current.y = desiredY;
    pan.setOffset({ x: desiredX, y: desiredY });
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: lastOffset.current.x, y: lastOffset.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        let newX = lastOffset.current.x + gesture.dx;
        let newY = lastOffset.current.y + gesture.dy;
        const cs = containerSizeRef.current;
        const ss = scaledSizeRef.current;
        const minX = Math.min(0, cs.w - ss.w);
        const maxX = 0;
        const minY = Math.min(0, cs.h - ss.h);
        const maxY = 0;
        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);
        pan.x.setValue(newX - lastOffset.current.x);
        pan.y.setValue(newY - lastOffset.current.y);
      },
      onPanResponderRelease: (e, gesture) => {
        let newX = lastOffset.current.x + gesture.dx;
        let newY = lastOffset.current.y + gesture.dy;
        const cs = containerSizeRef.current;
        const ss = scaledSizeRef.current;
        const minX = Math.min(0, cs.w - ss.w);
        const maxX = 0;
        const minY = Math.min(0, cs.h - ss.h);
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

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isUserAuthenticated();
      if (!isAuth) {
        navigation.replace("EF - Autenticación");
      }
    };
    checkAuth();
  }, [navigation]);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
      if (confirmed) {
        await authService.logout();
        navigation.replace("EF - Autenticación");
      }
    } else {
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que quieres cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar Sesión",
            style: "destructive",
            onPress: async () => {
              await authService.logout();
              navigation.replace("EF - Autenticación");
            },
          },
        ],
      );
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
    navigation.navigate("EF - Dashboard de Edificio", {
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
    return buildingsData
      .reduce((total, building) => total + building.consumption, 0)
      .toFixed(1);
  };

  /* ------------------------------- RENDER -------------------------------- */

  return (
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

      {/* Header con Gradiente Dinámico */}
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
            
            {/* Botones de acción del Header */}
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

        {/* Mapa Interactivo */}
        <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.mapTitle, { color: colors.text }]}>Mapa del Campus</Text>

            <View
              style={[styles.mapBox, { height: containerSize.h }]}
              onLayout={(e) => {
                const newSize = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
                setContainerSize(newSize);
                containerSizeRef.current = newSize;
                const s = Math.max(newSize.w / MAP_WIDTH, newSize.h / MAP_HEIGHT);
                setScale(s);
                scaleRef.current = s;
                const ss = { w: MAP_WIDTH * s, h: MAP_HEIGHT * s };
                setScaledSize(ss);
                scaledSizeRef.current = ss;
                const minX = Math.min(0, newSize.w - ss.w);
                const minY = Math.min(0, newSize.h - ss.h);
                lastOffset.current.x = clamp(lastOffset.current.x, minX, 0);
                lastOffset.current.y = clamp(lastOffset.current.y, minY, 0);
                pan.setOffset({ x: lastOffset.current.x, y: lastOffset.current.y });
                pan.setValue({ x: 0, y: 0 });
              }}
            >
              <View style={{ flex: 1, overflow: "hidden" }}>
                <Animated.View
                  {...panResponder.panHandlers}
                  style={{
                    width: scaledSize.w,
                    height: scaledSize.h,
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                  }}
                >
                  <ImageBackground
                    source={mapImage}
                    style={{ width: scaledSize.w, height: scaledSize.h }}
                    imageStyle={{ resizeMode: "cover" }}
                  >
                    {/* Hotspots */}
                    {(buildingsData.length ? buildingsData : campusBuildingsConfig).map((b) => {
                      const pos = b.position || { x: 0, y: 0 };
                      const size = b.size || { w: 80, h: 40 };
                      const posX = pos.x * scale;
                      const posY = pos.y * scale;
                      const w = size.w * scale;
                      const h = size.h * scale;

                      if (b.shape === "hex") {
                        const points = `${w * 0.25},0 ${w * 0.75},0 ${w},${h * 0.5} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h * 0.5}`;
                        return (
                          <Svg
                            key={b.id}
                            style={{
                              position: "absolute",
                              left: posX,
                              top: posY,
                              width: w,
                              height: h,
                              ...(Platform.OS === "web" ? { cursor: "pointer", userSelect: "none" } : {}),
                            }}
                            viewBox={`0 0 ${w} ${h}`}
                          >
                            <Polygon
                              points={points}
                              fill={theme.dark ? "#4b5563" : "#6b7280"} // Color dinámico
                              opacity={0.35}
                              stroke={theme.dark ? "#9ca3af" : "#000"}
                              strokeWidth={2}
                              onPress={() => handleBuildingPress(b)}
                            />
                            <SvgText
                              x={w / 2}
                              y={h / 2 - 4}
                              fill="#fff"
                              fontFamily="Arial"
                              fontWeight="800"
                              fontSize={14 * scale}
                              textAnchor="middle"
                              pointerEvents="none"
                            >
                              {b.code}
                            </SvgText>
                            <SvgText
                              x={w / 2}
                              y={h / 2 + 12}
                              fill="#e2e8f0"
                              fontFamily="Arial"
                              fontWeight="600"
                              fontSize={10 * scale}
                              textAnchor="middle"
                              pointerEvents="none"
                            >
                              {(b.consumption || 0).toFixed(1)} kWh
                            </SvgText>
                          </Svg>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={b.id}
                          onPress={() => handleBuildingPress(b)}
                          activeOpacity={0.85}
                          style={{
                            position: "absolute",
                            left: posX,
                            top: posY,
                            width: w,
                            height: h,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 6,
                            backgroundColor: `${b.color || (theme.dark ? "#4b5563" : "#6b7280")}55`,
                            borderWidth: 2,
                            borderColor: theme.dark ? "#ffffff55" : "#00000055",
                          }}
                        >
                          <Text style={{ fontWeight: "800", color: "#fff", fontSize: 14 * scale }}>
                            {b.code}
                          </Text>
                          <Text
                            style={{
                              fontWeight: "600",
                              fontSize: 10 * scale,
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

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={centerMap}
                style={[styles.compassContainer, { backgroundColor: theme.dark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255,255,255,0.95)' }]}
              >
                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                  <Polygon points="50,8 60,50 50,42 40,50" fill="#ef4444" opacity={0.95} />
                  <Polygon points="50,92 40,50 50,58 60,50" fill={theme.dark ? "#9ca3af" : "#374151"} opacity={0.9} />
                  <SvgText x="50" y="18" textAnchor="middle" fontWeight="800" fontSize="12" fill={theme.dark ? "#fff" : "#111"}>N</SvgText>
                  <SvgText x="84" y="52" textAnchor="middle" fontWeight="700" fontSize="12" fill={theme.dark ? "#fff" : "#111"}>E</SvgText>
                  <SvgText x="50" y="88" textAnchor="middle" fontWeight="700" fontSize="12" fill={theme.dark ? "#fff" : "#111"}>S</SvgText>
                  <SvgText x="16" y="52" textAnchor="middle" fontWeight="700" fontSize="12" fill={theme.dark ? "#fff" : "#111"}>W</SvgText>
                </Svg>
              </TouchableOpacity>
            </View>

        </View>

        {/* Lista de edificios con Colores Dinámicos */}
        <View style={[styles.buildingsListContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.buildingsListTitle, { color: colors.text }]}>Edificios del Campus</Text>
          
          {buildingsData.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={[styles.buildingCard, { 
                backgroundColor: theme.dark ? colors.background : '#f8fafc', 
                borderColor: colors.border 
              }]}
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

        <View style={{ height: insets.bottom || 20 }} />
      </ScrollView>
    </View>
  );
};

/* --------------------------------- STYLES -------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === "web" && { minHeight: "100vh" }),
  },
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

  /* Botones Header Actualizados */
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
  settingsButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
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

  content: { flex: 1 },

  /* Tarjeta resumen */
  summaryContainer: {
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
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 32, fontWeight: "bold", color: "#ab70c1ff" },
  summarySubtitle: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "bold",
  },

  /* Contenedor del mapa */
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
  },
  compassContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#00000010",
    zIndex: 9999,
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

  /* Lista inferior */
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },
});

export default CampusMapScreen;