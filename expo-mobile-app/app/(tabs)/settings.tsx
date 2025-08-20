import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  List,
  Switch,
  Button,
  Avatar,
  Surface,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRefresh: true,
    dataUsage: false,
    energyAlerts: true,
    maintenanceAlerts: true,
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de Energy Flow',
      'Energy Flow v1.0.0\n\nAplicación móvil para el monitoreo energético de la Universidad de Colima.\n\nDesarrollado por el Laboratorio de IoT y Sistemas Embebidos (LIOT).',
      [{ text: 'OK' }]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Exportar Datos',
      'Esta funcionalidad permite exportar los datos energéticos en diferentes formatos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'CSV', onPress: () => console.log('Export CSV') },
        { text: 'PDF', onPress: () => console.log('Export PDF') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Perfil del Usuario */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={64} 
                label={user?.name?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="titleLarge" style={styles.userName}>
                  {user?.name || 'Usuario'}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email || 'usuario@ucol.mx'}
                </Text>
                <Surface style={styles.roleBadge}>
                  <Text variant="bodySmall" style={styles.roleText}>
                    Usuario UCOL
                  </Text>
                </Surface>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notificaciones
            </Text>
            
            <List.Item
              title="Notificaciones push"
              description="Recibir notificaciones en tiempo real"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={() => handleSettingChange('notifications')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Alertas de energía"
              description="Notificar sobre consumos elevados"
              left={(props) => <List.Icon {...props} icon="flash-alert" />}
              right={() => (
                <Switch
                  value={settings.energyAlerts}
                  onValueChange={() => handleSettingChange('energyAlerts')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Alertas de mantenimiento"
              description="Notificar sobre edificios en mantenimiento"
              left={(props) => <List.Icon {...props} icon="wrench-clock" />}
              right={() => (
                <Switch
                  value={settings.maintenanceAlerts}
                  onValueChange={() => handleSettingChange('maintenanceAlerts')}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Configuración de la Aplicación */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Aplicación
            </Text>
            
            <List.Item
              title="Modo oscuro"
              description="Cambiar tema de la aplicación"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => handleSettingChange('darkMode')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Actualización automática"
              description="Actualizar datos cada 20 segundos"
              left={(props) => <List.Icon {...props} icon="refresh-auto" />}
              right={() => (
                <Switch
                  value={settings.autoRefresh}
                  onValueChange={() => handleSettingChange('autoRefresh')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Ahorro de datos"
              description="Reducir el uso de datos móviles"
              left={(props) => <List.Icon {...props} icon="data-usage" />}
              right={() => (
                <Switch
                  value={settings.dataUsage}
                  onValueChange={() => handleSettingChange('dataUsage')}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Datos y Exportación */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Datos
            </Text>
            
            <List.Item
              title="Exportar datos"
              description="Descargar datos en CSV o PDF"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={handleDataExport}
            />
            
            <List.Item
              title="Limpiar caché"
              description="Eliminar datos temporales almacenados"
              left={(props) => <List.Icon {...props} icon="delete-sweep" />}
              onPress={() => {
                Alert.alert(
                  'Limpiar Caché',
                  '¿Estás seguro? Esto eliminará todos los datos temporales.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Limpiar', style: 'destructive', onPress: () => console.log('Clear cache') },
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Información y Soporte */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Información
            </Text>
            
            <List.Item
              title="Acerca de"
              description="Información de la aplicación"
              left={(props) => <List.Icon {...props} icon="information" />}
              onPress={handleAbout}
            />
            
            <List.Item
              title="Contacto LIOT"
              description="Laboratorio de IoT y Sistemas Embebidos"
              left={(props) => <List.Icon {...props} icon="email" />}
              onPress={() => {
                Alert.alert(
                  'Contacto LIOT',
                  'Email: liot@ucol.mx\nTeléfono: +52 312 316 1000\nUbicación: Facultad de Ingeniería, UCOL',
                  [{ text: 'OK' }]
                );
              }}
            />
            
            <List.Item
              title="Términos y privacidad"
              description="Políticas de uso y privacidad"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              onPress={() => {
                Alert.alert(
                  'Términos y Privacidad',
                  'Esta aplicación respeta tu privacidad y cumple con las políticas de protección de datos de la Universidad de Colima.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Estadísticas de Uso */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Estadísticas de Uso
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.statLabel}>Tiempo en app</Text>
                <Text variant="titleSmall" style={styles.statValue}>2h 35m</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="visibility" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.statLabel}>Consultas hoy</Text>
                <Text variant="titleSmall" style={styles.statValue}>24</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="data-usage" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.statLabel}>Datos usados</Text>
                <Text variant="titleSmall" style={styles.statValue}>12.5 MB</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Botón de Cerrar Sesión */}
        <Card style={[styles.settingsCard, styles.logoutCard]}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              icon="logout"
              buttonColor="#F44336"
              textColor="#fff"
              style={styles.logoutButton}
              contentStyle={styles.logoutButtonContent}
            >
              Cerrar Sesión
            </Button>
          </Card.Content>
        </Card>

        {/* Información de Versión */}
        <View style={styles.versionInfo}>
          <Text variant="bodySmall" style={styles.versionText}>
            Energy Flow Mobile v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.versionText}>
            Universidad de Colima © 2024
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  userEmail: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: theme.colors.primaryContainer,
  },
  roleText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: 'bold',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  logoutCard: {
    marginBottom: 8,
  },
  logoutButton: {
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  versionText: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
  },
});