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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchLatestData } from "../data/energy_data";
import { authService } from "../../lib/auth";
import { ImageBackground } from "react-native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";
const mapImage = require("../../assets/MapConcept2.png");
const { width } = Dimensions.get("window");

// Tamaño del PNG usado para el panning, si la reslución del PNG cambia, tambíen debe cambiarse aquí
const MAP_WIDTH = 1450;  
const MAP_HEIGHT = 712;
/* Configuración de edificios del campus (un sensor = un edificio)
   name: etiqueta visible completa en tarjetas
   code: etiqueta corta usada sobre el edificio (A1, LSE, etc.)
   position: coordenadas relativas dentro del contenedor del mapa (px) 
*/
const campusBuildingsConfig = [
  {
    id: "AULA1", name: "Edificio Principal (A1)",code: "A1", position: { x: 621, y: 368   }, shape: "hex", size: { w: 174, h: 154 },
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
  const insets = useSafeAreaInsets();

  // Panning state for map navigation
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: width - 40, h: 620 });
  const containerSizeRef = useRef(containerSize);

  // scale state: how much the original PNG is scaled to fit container width
  // Compute initial scale so the scaled map covers the container
  // in at least one dimension (width or height) to avoid it
  // becoming extremely small on narrow screens.
  const initialScale = Math.max(
    (containerSize.w || (width - 40)) / MAP_WIDTH,
    (containerSize.h || 620) / MAP_HEIGHT,
  );
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(scale);
  const [scaledSize, setScaledSize] = useState({ w: MAP_WIDTH * scale, h: MAP_HEIGHT * scale });
  const scaledSizeRef = useRef(scaledSize);

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
        // compute clamped absolute position using scaled dimensions
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
        // set relative values (because offset is set)
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

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isUserAuthenticated();
      if (!isAuth) {
        // Si no hay sesión, redirigir al login
        navigation.replace("EF - Autenticación");
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
        navigation.replace("EF - Autenticación");
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
              navigation.replace("EF - Autenticación");
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

            {/* 🔵 MAPA PNG INTERACTIVO (reemplaza GOOGLE MAPS) */}
            <View
              style={[styles.mapBox, { height: containerSize.h }]}
              onLayout={(e) => {
                const newSize = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
                setContainerSize(newSize);
                containerSizeRef.current = newSize;
                // compute scale so scaled map covers the container in
                // both dimensions (choose the larger ratio). This
                // prevents the image from shrinking excessively on
                // narrow screens and avoids white-space when panning.
                const s = Math.max(newSize.w / MAP_WIDTH, newSize.h / MAP_HEIGHT);
                setScale(s);
                scaleRef.current = s;
                const ss = { w: MAP_WIDTH * s, h: MAP_HEIGHT * s };
                setScaledSize(ss);
                scaledSizeRef.current = ss;
                // ensure pan offsets stay clamped to new sizes
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
                    {/* 🔵 Hotspots interactivos encima del PNG (se mueven con la imagen) */}
                    {(buildingsData.length ? buildingsData : campusBuildingsConfig).map((b) => {
                      const pos = b.position || { x: 0, y: 0 };
                      const size = b.size || { w: 80, h: 40 }; // ajustable
                      const posX = pos.x * scale;
                      const posY = pos.y * scale;
                      const w = size.w * scale;
                      const h = size.h * scale;

                      // Forma del edifico A1 hexagonal
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
                              ...(Platform.OS === "web" ? { cursor: "pointer", userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" } : {}),
                            }}
                            viewBox={`0 0 ${w} ${h}`}
                          >
                            <Polygon
                              points={points}
                              fill="#6b7280"
                              opacity={0.35}
                              stroke="#000"
                              strokeWidth={2}
                              onPress={() =>
                                navigation.navigate("BuildingDashboard", {
                                  buildingId: b.id,
                                  buildingName: b.name,
                                  buildingData: b,
                                })
                              }
                            />
                            <SvgText
                              x={w / 2}
                              y={h / 2 - 4}
                              fill="#fff"
                              fontFamily="Arial"
                              fontWeight="800"
                              fontSize={14 * scale}
                              textAnchor="middle"
                              // prevent the SVG text from capturing pointer events/selection
                              pointerEvents="none"
                            >
                              {b.code}
                            </SvgText>
                            <SvgText
                              x={w / 2}
                              y={h / 2 + 12}
                              fill="#e2e8f0"
                              fontFamily="Arial"
                              fontWeight={600}
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
                            left: posX,
                            top: posY,
                            width: w,
                            height: h,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 6,
                            backgroundColor: `${b.color || "#6b7280"}55`,
                            borderWidth: 2,
                            borderColor: "#00000055",
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
    height: 620,
    borderRadius: 10,
    overflow: "hidden",
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
