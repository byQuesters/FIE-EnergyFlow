import { supabase } from '../../lib/supabase';

// Helper to map supabase row to UI structure
export const mapRowToBuildingData = (row) => {
  if (!row) return null;
// Consumo total ahora definido como la suma de voltajes RMS por fase
  const consumption = parseFloat((row.V_RMSA + row.V_RMSB + row.V_RMSC).toFixed(1));
  // Simple thresholds
  let status = 'normal';
  if (consumption < 200) status = 'low';
  else if (consumption < 400) status = 'normal';
  else if (consumption < 600) status = 'high';
  else status = 'critical';

  // Generate simple historical chart data from current reading as placeholder
  const labels24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const hourlyData = {
    labels: labels24,
    datasets: [
      {
        data: labels24.map(() => parseFloat((consumption / 24).toFixed(1))),
        color: () => '#3b82f6',
        strokeWidth: 2,
      },
    ],
  };

  // Phase distribution data (percentage)
  const totalPhaseEnergy = row.kWhA + row.kWhB + row.kWhC || 1;
  const phasesData = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [row.kWhA, row.kWhB, row.kWhC].map((v) => parseFloat(((v / totalPhaseEnergy) * 100).toFixed(1))),
      },
    ],
  };

  return {
    id: row.device_id,
    consumption,
    status,
    realTimeData: row,
    chartData: {
      hourly: hourlyData,
      phases: phasesData,
    },
  };
};

// Verificar si hay datos recientes (últimos 2 minutos)
export const checkServerStatus = async (deviceId) => {
  const { data, error } = await supabase
    .from('ElectricalData')
    .select('timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking server status:', error);
    return { isActive: false, lastUpdate: null };
  }

  if (!data) {
    return { isActive: false, lastUpdate: null };
  }

  const lastUpdateTime = new Date(data.timestamp);
  const now = new Date();
  const diffMinutes = (now - lastUpdateTime) / 1000 / 60;

  return {
    isActive: diffMinutes <= 2,
    lastUpdate: lastUpdateTime,
    minutesAgo: Math.floor(diffMinutes)
  };
};

// Fetch the latest N records (default 10) for a given device_id
export const fetchRecentData = async (deviceId, limit = 10) => {
  if (!deviceId) return [];
  const { data, error } = await supabase
    .from('ElectricalData')
    .select('*')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase fetchRecentData error', error);
    return [];
  }
  return data || [];
};


// Fetch latest reading for device_id (string)
export const fetchLatestData = async (deviceId = null) => {
  let query = supabase
    .from('ElectricalData')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1);

  if (deviceId) {
    query = query.eq('device_id', deviceId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase fetch error', error);
    return null;
  }
  if (!data) return null;
  return mapRowToBuildingData(data);
};
