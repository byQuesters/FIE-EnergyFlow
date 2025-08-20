# Guía de Instalación - Energy Flow Mobile

## 📋 Requisitos Previos

### Software Necesario
1. **Node.js** (v18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **npm** o **yarn** (incluido con Node.js)
   - Verificar npm: `npm --version`

3. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

4. **Git** (para clonar repositorios)
   - Descargar desde: https://git-scm.com/

### Para Desarrollo Móvil
1. **Expo Go App** (para testing)
   - iOS: Descargar desde App Store
   - Android: Descargar desde Google Play Store

2. **Para builds nativos (opcional)**
   - **Android Studio** (para Android)
   - **Xcode** (para iOS, solo en macOS)

## 🚀 Instalación Paso a Paso

### 1. Preparar el Proyecto
```bash
# Navegar al directorio del proyecto
cd expo-mobile-app

# Verificar que tienes todos los archivos necesarios
ls -la
```

### 2. Instalar Dependencias
```bash
# Usando npm
npm install

# O usando yarn (si prefieres)
yarn install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu configuración
# Usar tu editor favorito (nano, vim, VSCode, etc.)
nano .env
```

**Configuración típica para desarrollo:**
```env
API_BASE_URL=http://localhost:3000
DEBUG_MODE=true
MOCK_API_RESPONSES=false
```

### 4. Verificar la Configuración
```bash
# Verificar que no hay errores de TypeScript
npx tsc --noEmit

# Verificar que las dependencias están correctas
npm ls
```

## 🎯 Ejecutar la Aplicación

### Método 1: Servidor de Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start
# o
npx expo start
```

Esto abrirá Expo DevTools en tu navegador con un código QR.

### Método 2: Plataforma Específica
```bash
# Para Android
npm run android
# o
npx expo start --android

# Para iOS (requiere macOS)
npm run ios  
# o
npx expo start --ios

# Para web
npm run web
# o
npx expo start --web
```

### Método 3: Usando Expo Go
1. Abre Expo Go en tu dispositivo móvil
2. Escanea el código QR desde el terminal o navegador
3. La app se cargará automáticamente

## 🔧 Configuración del Backend

### Si tienes el servidor web ejecutándose localmente:
1. Asegúrate de que el servidor Next.js esté ejecutándose en `http://localhost:3000`
2. La aplicación móvil se conectará automáticamente

### Para conexión a servidor remoto:
1. Actualiza `API_BASE_URL` en `.env`
2. Asegúrate de que el servidor permita conexiones CORS desde dispositivos móviles

## 📱 Testing en Dispositivos

### Android
1. **Expo Go**: Instala desde Google Play Store
2. **USB Debugging**: Habilita en Configuración > Opciones de desarrollador
3. **Conexión directa**: `adb connect <device-ip>`

### iOS
1. **Expo Go**: Instala desde App Store
2. **Conexión Wi-Fi**: Asegúrate de estar en la misma red
3. **Certificados**: Para builds de producción, configura certificados en EAS

## 🛠️ Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Limpiar caché y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: "Metro bundler issues"
```bash
# Limpiar caché de Metro
npx expo start --clear
```

### Error: "TypeScript configuration"
```bash
# Verificar configuración de TypeScript
npx tsc --showConfig
```

### Error: "Cannot connect to device"
```bash
# Verificar que dispositivo y computadora están en la misma red
# Para Android, verificar que ADB detecta el dispositivo
adb devices
```

### Error: "Expo Go not loading"
```bash
# Verificar que el firewall permite conexiones en puerto 19000-19006
# En Windows: Permitir Node.js en el firewall
# En macOS: Verificar configuración de red
```

## 🔄 Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar Expo SDK (con precaución)
npx expo upgrade
```

## 📋 Checklist de Verificación

Antes de reportar problemas, verifica:

- [ ] Node.js v18+ instalado
- [ ] Expo CLI instalado globalmente
- [ ] Todas las dependencias instaladas (`npm install` exitoso)
- [ ] Variables de entorno configuradas
- [ ] Backend ejecutándose (si es local)
- [ ] Dispositivo en la misma red Wi-Fi
- [ ] Expo Go actualizado a la última versión
- [ ] Firewall permite conexiones a puertos Expo

## 📞 Soporte

Si encuentras problemas:

1. **Documentación Expo**: https://docs.expo.dev/
2. **React Native Docs**: https://reactnative.dev/docs
3. **Stack Overflow**: Busca errores específicos
4. **Contacto LIOT**: liot@ucol.mx

## 📈 Siguientes Pasos

Una vez que la aplicación esté funcionando:

1. **Explorar funcionalidades**: Dashboard, mapa, edificios, configuración
2. **Personalizar configuración**: Tema, notificaciones, actualización automática
3. **Testing en producción**: Crear builds con EAS
4. **Despliegue**: App Store / Google Play Store

---

**¡Listo!** Tu aplicación Energy Flow Mobile debería estar funcionando correctamente.