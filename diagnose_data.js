// Script de diagnóstico para revisar datos de Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rdzfihpwevwkxqwfdkao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkemZpaHB3ZXZ3a3hxd2Zka2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDY0NjIsImV4cCI6MjA0NzE4MjQ2Mn0.RaXZcNx3bEfFDuO8iyhJFKIpjqvnPyqXyQH9YwNZNaA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseData() {
  console.log('🔍 DIAGNÓSTICO DETALLADO - VALORES kWh\n');
  console.log('='.repeat(70));

  try {
    // Obtener últimos 20 registros para ver patrón
    const { data, error } = await supabase
      .from('ElectricalData')
      .select('timestamp, kWhA, kWhB, kWhC, PPROM_A, PPROM_B, PPROM_C')
      .eq('device_id', 'photon-001')
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No hay datos');
      return;
    }

    console.log(`\n✅ Últimos 20 registros (más reciente primero):\n`);

    let sumaKwhA = 0;
    let sumaKwhB = 0;
    let sumaKwhC = 0;

    data.forEach((row, i) => {
      const time = new Date(row.timestamp).toLocaleString('es-MX');
      const kwhA = Math.abs(row.kWhA || 0);
      const kwhB = Math.abs(row.kWhB || 0);
      const kwhC = Math.abs(row.kWhC || 0);
      const total = kwhA + kwhB + kwhC;

      sumaKwhA += kwhA;
      sumaKwhB += kwhB;
      sumaKwhC += kwhC;

      console.log(`${i + 1}. ${time}`);
      console.log(`   kWh: A=${kwhA.toFixed(6)} | B=${kwhB.toFixed(6)} | C=${kwhC.toFixed(6)} | Total=${total.toFixed(6)}`);
      console.log(`   Potencias (W): A=${row.PPROM_A?.toFixed(1)} | B=${row.PPROM_B?.toFixed(1)} | C=${row.PPROM_C?.toFixed(1)}`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log('\n� ANÁLISIS DE LOS 20 REGISTROS:\n');
    console.log(`Suma Total kWhA: ${sumaKwhA.toFixed(6)} kWh`);
    console.log(`Suma Total kWhB: ${sumaKwhB.toFixed(6)} kWh`);
    console.log(`Suma Total kWhC: ${sumaKwhC.toFixed(6)} kWh`);
    console.log(`SUMA TOTAL: ${(sumaKwhA + sumaKwhB + sumaKwhC).toFixed(6)} kWh`);
    
    // Calcular tiempo entre registros
    if (data.length >= 2) {
      const t1 = new Date(data[0].timestamp);
      const t2 = new Date(data[1].timestamp);
      const diffSeconds = Math.abs(t1 - t2) / 1000;
      console.log(`\n⏱️  Tiempo entre registros: ~${diffSeconds} segundos`);
    }

    // Análisis de qué representan los valores
    console.log('\n\n🧮 INTERPRETACIÓN:\n');
    console.log('Si el Photon envía cada 10 segundos el consumo DE ESOS 10 segundos:');
    console.log('Entonces los valores kWh ya están "normalizados" a 10 segundos.');
    console.log('');
    console.log('Para calcular consumo de 1 hora (3600 segundos):');
    console.log(`  - 1 hora = 360 registros (3600s / 10s)`);
    console.log(`  - Consumo/hora = suma de 360 registros`);
    console.log(`  - Con estos valores: ~${((sumaKwhA + sumaKwhB + sumaKwhC) * 18).toFixed(3)} kWh/hora`);
    console.log('');
    
    const consumoDiario = (sumaKwhA + sumaKwhB + sumaKwhC) * 18 * 24;
    console.log(`📅 Proyección de consumo diario: ${consumoDiario.toFixed(2)} kWh/día`);
    
    if (consumoDiario > 100) {
      console.log('\n⚠️  ADVERTENCIA: El consumo proyectado es MUY ALTO (>100 kWh/día)');
      console.log('   Posibles causas:');
      console.log('   1. Los valores kWh del Photon están mal calculados (multiplicados por factor incorrecto)');
      console.log('   2. El sensor está midiendo potencia en vez de energía');
      console.log('   3. Hay un error en la conversión de unidades');
    }

    // Verificar si los kWh corresponden con las potencias
    console.log('\n\n� VERIFICACIÓN POTENCIA vs ENERGÍA:\n');
    const registro = data[0];
    const potenciaTotal = Math.abs(registro.PPROM_A || 0) + Math.abs(registro.PPROM_B || 0) + Math.abs(registro.PPROM_C || 0);
    const energiaEsperada = (potenciaTotal * 10) / 3600000; // Watts * segundos / 3600000 = kWh
    const energiaReal = Math.abs(registro.kWhA || 0) + Math.abs(registro.kWhB || 0) + Math.abs(registro.kWhC || 0);
    
    console.log(`Potencia total medida: ${potenciaTotal.toFixed(2)} W`);
    console.log(`Energía esperada en 10s: ${energiaEsperada.toFixed(8)} kWh`);
    console.log(`Energía reportada en BD: ${energiaReal.toFixed(8)} kWh`);
    console.log(`Ratio: ${(energiaReal / energiaEsperada).toFixed(2)}x`);
    
    if (energiaReal > energiaEsperada * 10) {
      console.log('\n❌ ERROR DETECTADO: Los valores kWh están inflados');
      console.log('   La energía reportada es MUCHO mayor que la calculada con la potencia.');
      console.log('   Revisa el código del Photon que calcula kWh.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

diagnoseData();
