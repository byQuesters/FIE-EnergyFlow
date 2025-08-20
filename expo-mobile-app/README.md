# Energy Flow Mobile App

Aplicación móvil para el monitoreo energético de la Universidad de Colima, desarrollada con Expo/React Native.

## 🎯 Descripción

Energy Flow Mobile es la versión móvil del sistema de monitoreo energético de la Universidad de Colima. Permite visualizar en tiempo real el consumo energético de los diferentes edificios del campus a través de dispositivos móviles.

## 🚀 Características

- **Dashboard en tiempo real**: Visualización de métricas energéticas actualizadas cada 20 segundos
- **Gráficas interactivas**: Múltiples tipos de gráficas para análisis de datos
- **Mapa de campus**: Vista geográfica de todos los edificios monitoreados
- **Lista de edificios**: Información detallada de cada edificio
- **Autenticación segura**: Sistema de login con credenciales institucionales
- **Configuración personalizable**: Ajustes de notificaciones y preferencias
- **Modo offline**: Funcionalidad básica sin conexión a internet
- **Exportación de datos**: Descarga de reportes en CSV y PDF

## 🛠️ Tecnologías

- **Framework**: Expo SDK 51
- **UI Library**: React Native Paper
- **Estado**: Redux Toolkit
- **Navegación**: Expo Router
- **Gráficas**: React Native Chart Kit
- **Almacenamiento**: Expo SecureStore
- **Iconos**: MaterialIcons
- **TypeScript**: Para tipado estático

## 📱 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Expo Go app (para testing en dispositivo)

### Configuración del proyecto

1. **Clonar o copiar los archivos del proyecto**
   ```bash
   cd expo-mobile-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   API_BASE_URL=http://localhost:3000
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run start
   # o
   expo start
   ```

5. **Ejecutar en dispositivo**
   - Escanear código QR con Expo Go
   - O usar comandos específicos:
   ```bash
   npm run android  # Para Android
   npm run ios      # Para iOS
   ```

## 🏗️ Estructura del Proyecto

```
expo-mobile-app/
├── app/                    # Navegación con Expo Router
│   ├── (auth)/            # Pantallas de autenticación
│   ├── (tabs)/            # Pantallas principales con tabs
│   ├── _layout.tsx        # Layout principal
│   └── index.tsx          # Pantalla de splash
├── assets/                # Recursos estáticos
│   ├── ucol-icon.png      # Logo de la universidad
│   ├── splash.png         # Imagen de splash
│   └── campus-map.png     # Mapa del campus
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── constants/         # Configuraciones y constantes
│   ├── services/          # Servicios de API
│   ├── store/             # Estado global con Redux
│   ├── types/             # Definiciones de TypeScript
│   └── utils/             # Utilidades
├── app.json               # Configuración de Expo
├── package.json           # Dependencias
├── tsconfig.json          # Configuración de TypeScript
└── README.md
```

## 📊 Funcionalidades Principales

### Dashboard
- Métricas en tiempo real (potencia, energía, voltaje, corriente)
- Gráficas de barras, líneas y circulares
- Detalles por fase eléctrica
- Indicadores de impacto ambiental
- Estado de conexión en tiempo real

### Mapa
- Vista geográfica del campus
- Marcadores interactivos por edificio
- Estadísticas generales
- Filtros por estado de edificio

### Edificios
- Lista completa de edificios monitoreados
- Búsqueda y filtros avanzados
- Métricas individuales por edificio
- Estado de mantenimiento

### Configuración
- Preferencias de usuario
- Configuración de notificaciones
- Modo oscuro/claro
- Estadísticas de uso
- Exportación de datos

## 🔧 Configuración de API

La aplicación se conecta al backend web existente. Asegúrate de configurar correctamente:

1. **URL del API** en `src/constants/config.ts`
2. **Endpoints disponibles**:
   - `GET /api/get-data` - Datos en tiempo real
   - `POST /api/auth/login` - Autenticación
   - `POST /api/auth/register` - Registro
   - `GET /api/buildings/:id` - Datos por edificio

## 🚀 Build y Deployment

### Build de desarrollo
```bash
eas build --profile development
```

### Build de preview
```bash
eas build --profile preview
```

### Build de producción
```bash
eas build --profile production
```

### Configuración de signing
1. Configurar certificados en EAS
2. Actualizar `eas.json` con credenciales
3. Configurar bundle identifiers únicos

## 📱 Compatibilidad

- **iOS**: 13.0 o superior
- **Android**: API level 21 (Android 5.0) o superior
- **Expo SDK**: 51.x
- **React Native**: 0.74.x

## 🎨 Diseño

La aplicación mantiene la identidad visual de la Universidad de Colima:
- **Color primario**: #7b8f35 (Verde UCOL)
- **Color secundario**: #ccdb94 (Verde claro)
- **Tipografía**: System fonts
- **Iconografía**: Material Design Icons

## 🧪 Testing

```bash
npm run test
```

Para testing manual, usa Expo Go o un simulador/emulador.

## 📚 Documentación Adicional

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo Router](https://expo.github.io/router/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es propiedad de la Universidad de Colima. Todos los derechos reservados.

## 👥 Equipo de Desarrollo

**Laboratorio de IoT y Sistemas Embebidos (LIOT)**
- Universidad de Colima
- Facultad de Ingeniería
- Email: liot@ucol.mx

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación:
- Email: liot@ucol.mx
- Teléfono: +52 312 316 1000
- Ubicación: Facultad de Ingeniería, Universidad de Colima

---

**Energy Flow Mobile v1.0.0**  
Universidad de Colima © 2024