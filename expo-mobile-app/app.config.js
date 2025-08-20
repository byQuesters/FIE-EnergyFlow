import 'dotenv/config';

export default {
  expo: {
    name: 'Energy Flow',
    slug: 'energy-flow-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/ucol-icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/ucol-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#7b8f35'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ucol.energyflow',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'Esta aplicación requiere acceso a la ubicación para mostrar el mapa del campus.',
        NSCameraUsageDescription: 'Esta aplicación puede usar la cámara para escanear códigos QR.',
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/ucol-icon.png',
        backgroundColor: '#7b8f35'
      },
      package: 'com.ucol.energyflow',
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ]
    },
    web: {
      favicon: './assets/ucol-icon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#7b8f35',
          image: './assets/ucol-icon.png',
          dark: {
            image: './assets/ucol-icon.png',
            backgroundColor: '#2c3e50'
          },
          imageWidth: 200
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/ucol-icon.png',
          color: '#7b8f35',
          sounds: ['./assets/notification.wav']
        }
      ]
    ],
    scheme: 'energy-flow',
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      particleDeviceId: process.env.PARTICLE_DEVICE_ID,
      particleToken: process.env.PARTICLE_TOKEN,
      debugMode: process.env.DEBUG_MODE === 'true',
      mockApiResponses: process.env.MOCK_API_RESPONSES === 'true',
      eas: {
        projectId: 'your-eas-project-id'
      }
    }
  }
};