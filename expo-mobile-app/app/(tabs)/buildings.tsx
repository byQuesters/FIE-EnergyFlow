import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import {
  Card,
  Text,
  Surface,
  Searchbar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface BuildingData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  currentPower: number;
  totalEnergy: number;
  location: string;
  floors: number;
  lastUpdate: string;
  efficiency: number;
}

const buildingsData: BuildingData[] = [
  {
    id: '1',
    name: 'Edificio Principal',
    description: 'Rectoría y oficinas administrativas principales de la universidad',
    status: 'active',
    currentPower: 2500,
    totalEnergy: 1250.5,
    location: 'Campus Central',
    floors: 3,
    lastUpdate: '2024-01-20 14:30:00',
    efficiency: 85,
  },
  {
    id: '2',
    name: 'Laboratorio de Ingeniería',
    description: 'LIOT - Laboratorio de IoT y Sistemas Embebidos',
    status: 'active',
    currentPower: 1800,
    totalEnergy: 890.2,
    location: 'Facultad de Ingeniería',
    floors: 2,
    lastUpdate: '2024-01-20 14:25:00',
    efficiency: 92,
  },
  {
    id: '3',
    name: 'Biblioteca Central',
    description: 'Centro de información y recursos académicos',
    status: 'active',
    currentPower: 950,
    totalEnergy: 445.8,
    location: 'Campus Central',
    floors: 4,
    lastUpdate: '2024-01-20 14:28:00',
    efficiency: 78,
  },
  {
    id: '4',
    name: 'Centro de Cómputo',
    description: 'Aulas de cómputo, servidores y servicios de TI',
    status: 'maintenance',
    currentPower: 0,
    totalEnergy: 0,
    location: 'Campus Central',
    floors: 2,
    lastUpdate: '2024-01-20 10:00:00',
    efficiency: 0,
  },
  {
    id: '5',
    name: 'Auditorio',
    description: 'Eventos, conferencias y actividades académicas',
    status: 'inactive',
    currentPower: 150,
    totalEnergy: 25.5,
    location: 'Campus Central',
    floors: 1,
    lastUpdate: '2024-01-20 14:32:00',
    efficiency: 45,
  },
  {
    id: '6',
    name: 'Laboratorio de Química',
    description: 'Laboratorios de investigación y práctica química',
    status: 'active',
    currentPower: 1200,
    totalEnergy: 650.3,
    location: 'Facultad de Ciencias',
    floors: 2,
    lastUpdate: '2024-01-20 14:29:00',
    efficiency: 88,
  },
  {
    id: '7',
    name: 'Cafetería Central',
    description: 'Servicios de alimentación para la comunidad universitaria',
    status: 'active',
    currentPower: 800,
    totalEnergy: 380.7,
    location: 'Campus Central',
    floors: 1,
    lastUpdate: '2024-01-20 14:31:00',
    efficiency: 72,
  },
];

export default function BuildingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const getStatusColor = (status: BuildingData['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'maintenance':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: BuildingData['status']) => {
    switch (status) {
      case 'active':
        return 'check-circle';
      case 'inactive':
        return 'pause-circle';
      case 'maintenance':
        return 'build-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: BuildingData['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return 'Desconocido';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return '#4CAF50';
    if (efficiency >= 70) return '#FF9800';
    return '#F44336';
  };

  const filteredBuildings = buildingsData.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         building.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         building.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || building.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderBuildingCard = ({ item }: { item: BuildingData }) => (
    <Card style={styles.buildingCard}>
      <Pressable
        style={styles.cardPressable}
        onPress={() => {
          // Navegar a detalles del edificio
          console.log('Navegar a detalles de:', item.name);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text variant="titleMedium" style={styles.buildingName}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.buildingLocation}>
                {item.location} • {item.floors} piso{item.floors > 1 ? 's' : ''}
              </Text>
            </View>
            <Surface style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <MaterialIcons
                name={getStatusIcon(item.status)}
                size={16}
                color="#fff"
              />
            </Surface>
          </View>

          <Text variant="bodyMedium" style={styles.buildingDescription}>
            {item.description}
          </Text>

          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <MaterialIcons name="flash-on" size={20} color="#2196F3" />
              <View style={styles.metricContent}>
                <Text variant="bodySmall" style={styles.metricLabel}>Potencia</Text>
                <Text variant="bodyMedium" style={styles.metricValue}>
                  {item.currentPower} W
                </Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="battery-charging-full" size={20} color="#4CAF50" />
              <View style={styles.metricContent}>
                <Text variant="bodySmall" style={styles.metricLabel}>Energía</Text>
                <Text variant="bodyMedium" style={styles.metricValue}>
                  {item.totalEnergy} kWh
                </Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="trending-up" size={20} color={getEfficiencyColor(item.efficiency)} />
              <View style={styles.metricContent}>
                <Text variant="bodySmall" style={styles.metricLabel}>Eficiencia</Text>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.metricValue, { color: getEfficiencyColor(item.efficiency) }]}
                >
                  {item.efficiency}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.statusInfo}>
              <Text variant="bodySmall" style={styles.statusLabel}>Estado:</Text>
              <Text 
                variant="bodySmall" 
                style={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {getStatusText(item.status)}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.lastUpdate}>
              Última actualización: {new Date(item.lastUpdate).toLocaleTimeString()}
            </Text>
          </View>
        </Card.Content>
      </Pressable>
    </Card>
  );

  const filterOptions = [
    { key: 'all', label: 'Todos', count: buildingsData.length },
    { key: 'active', label: 'Activos', count: buildingsData.filter(b => b.status === 'active').length },
    { key: 'inactive', label: 'Inactivos', count: buildingsData.filter(b => b.status === 'inactive').length },
    { key: 'maintenance', label: 'Mantenimiento', count: buildingsData.filter(b => b.status === 'maintenance').length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar edificios..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
        />
        
        <View style={styles.filtersContainer}>
          {filterOptions.map((option) => (
            <Chip
              key={option.key}
              selected={selectedFilter === option.key}
              onPress={() => setSelectedFilter(option.key as any)}
              style={[
                styles.filterChip,
                selectedFilter === option.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === option.key && styles.selectedFilterChipText
              ]}
            >
              {option.label} ({option.count})
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text variant="titleMedium" style={styles.resultsCount}>
          {filteredBuildings.length} edificio{filteredBuildings.length !== 1 ? 's' : ''} encontrado{filteredBuildings.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredBuildings}
        renderItem={renderBuildingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No se encontraron edificios
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Intenta cambiar los filtros o el término de búsqueda
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  selectedFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.onSurfaceVariant,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  resultsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  resultsCount: {
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  buildingCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardPressable: {
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  buildingName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  buildingLocation: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  buildingDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricContent: {
    marginTop: 4,
    alignItems: 'center',
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  metricValue: {
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    color: theme.colors.onSurfaceVariant,
    marginRight: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  lastUpdate: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.7,
  },
});