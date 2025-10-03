import Constants from 'expo-constants';

// Para Expo, las variables de entorno se acceden a través de Constants.expoConfig.extra
const getEnvVar = (key, fallback) => {
  // En desarrollo web de Expo, usar valores directos del .env
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Para web development, usar los valores directamente
    const envVars = {
      SUPABASE_URL: 'https://lpjxsvasvbpwazwobcnp.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwanhzdmFzdmJwd2F6d29iY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQ3ODUsImV4cCI6MjA2MzE5MDc4NX0.hi3V7w86WxIcpkA0tLZAgSHr9OZ-lGLU-twuigazh1A',
      DATABASE_URL: 'postgresql://postgres.lpjxsvasvbpwazwobcnp:EnergyFlow_01@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
    };
    return envVars[key] || fallback;
  }
  
  // En producción o apps nativas, usar Constants
  return Constants.expoConfig?.extra?.[key] || fallback;
};

export const config = {
  supabaseUrl: getEnvVar('SUPABASE_URL', 'https://lpjxsvasvbpwazwobcnp.supabase.co'),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwanhzdmFzdmJwd2F6d29iY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNjA2MDEsImV4cCI6MjA1MDczNjYwMX0.rS8tHUd5S_LNjb_gVj8k4nGBJLT7NXdSNEtB5SxE1XA'),
  databaseUrl: getEnvVar('DATABASE_URL', 'postgresql://postgres.lpjxsvasvbpwazwobcnp:EnergyFlow_01@aws-0-us-west-1.pooler.supabase.com:5432/postgres'),
};

console.log('Config loaded:', {
  supabaseUrl: config.supabaseUrl ? 'loaded' : 'missing',
  supabaseAnonKey: config.supabaseAnonKey ? 'loaded' : 'missing',
  databaseUrl: config.databaseUrl ? 'loaded' : 'missing'
});

export default config;
