# ⚡ FIE EnergyFlow

Sistema de monitoreo de energía para el campus universitario.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# 3. Iniciar API de Next.js
npm run dev

# 4. En otra terminal, iniciar Expo
npm start
```

### 📱 Testing en Dispositivos

- **Web**: Presiona `w` en la terminal de Expo
- **Android (emulador)**: Presiona `a` - funciona automáticamente
- **iOS (simulador)**: Presiona `i` - funciona automáticamente  
- **Dispositivo físico**: 
  1. Obtén tu IP local con `ipconfig`
  2. Agrega a `.env.local`: `EXPO_PUBLIC_API_URL=http://TU_IP:3000`
  3. Reinicia con `npm start -- --clear`

## 🌐 Despliegue a Producción

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Resumen rápido:
1. Conecta tu repo a [Vercel](https://vercel.com)
2. Configura las variables de entorno en Vercel
3. Haz push a `main` - Vercel despliega automáticamente

## 📁 Estructura del Proyecto

```
├── pages/api/          # API Routes de Next.js
├── src/screens/        # Pantallas de React Native
├── lib/               # Utilidades y configuración
├── prisma/            # Schema de base de datos
└── assets/            # Recursos estáticos
```

## 🛠️ Stack Tecnológico

- **Frontend Mobile**: React Native + Expo
- **Frontend Web**: Next.js + React
- **Backend API**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Styling**: NativeWind (Tailwind para RN)

## 📚 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar API de Next.js
npm start            # Iniciar Expo
npm run android      # Abrir en Android
npm run ios          # Abrir en iOS
npm run web          # Abrir en web

# Base de datos
npx prisma studio    # Abrir Prisma Studio
npx prisma migrate dev    # Ejecutar migraciones
npx prisma generate  # Generar cliente Prisma

# Producción
npm run build        # Build de Next.js
npm run server       # Iniciar servidor de producción
```

## 🔧 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 📖 Documentación

- [Guía de Despliegue](./DEPLOYMENT.md)
- [Configuración de CORS](./CORS_EXAMPLE.md)

## 👥 Equipo

Proyecto de tesis - FIE

## 📄 Licencia

Privado
