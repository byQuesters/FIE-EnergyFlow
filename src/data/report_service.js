import { fetchRecentData } from './energy_data'; 

// Esquemas Tarifarios Simulados CFE 2025
const TARIFF_SCHEMES = {
  DAC: {
    id: 'DAC',
    name: 'DAC (Doméstica Alto Consumo)',
    rates: {
      energia: 5.65,    // Precio único alto
      suministro: 135.00,
      iva: 0.16,
      dap: 0.03
    }
  },
  GDMTO: {
    id: 'GDMTO',
    name: 'GDMTO (Gran Demanda M.T.)',
    rates: {
      energia: 2.95,    // Precio promedio comercial
      suministro: 250.00, // Cargo fijo mayor
      iva: 0.16,
      dap: 0.05 // Derecho alumbrado mayor
    }
  }
};

const getDateRanges = () => {
  const today = new Date();
  
  // Últimos 7 días
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);

  // Mes Actual (1ro al día de hoy)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Mes Anterior (1ro al último día del mes anterior)
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    ultimos7dias: {
      label: 'Últimos 7 días',
      startDate: last7Days,
      endDate: today
    },
    mesActual: {
      label: 'Mes en curso',
      startDate: startOfMonth,
      endDate: today
    },
    mesAnterior: {
      label: 'Mes anterior',
      startDate: startOfLastMonth,
      endDate: endOfLastMonth
    }
  };
};

/**
 * Genera el reporte financiero
 * @param {string} tariffId - ID de la tarifa ('DAC' o 'GDMTO')
 */
const generateReport = async (buildingId, buildingName, startDate, endDate, maxRecords = 1000, correctionFactor = 1.0, tariffId = 'DAC') => {
  try {
    // Seleccionar esquema tarifario
    const selectedTariff = TARIFF_SCHEMES[tariffId] || TARIFF_SCHEMES.DAC;
    const rates = selectedTariff.rates;

    // 1. Obtener datos
    const rawData = await fetchRecentData(buildingId, maxRecords); 
    
    if (!rawData || rawData.length === 0) {
      return { success: false, message: 'No hay datos registrados en el servidor.' };
    }

    // 2. Filtrar por fechas
    const filteredData = rawData.filter(d => {
      const date = new Date(d.timestamp);
      return date >= startDate && date <= endDate;
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (filteredData.length < 2) {
      return { success: false, message: 'Insuficientes datos en el periodo para calcular consumo.' };
    }

    const firstRecord = filteredData[0];
    const lastRecord = filteredData[filteredData.length - 1];

    // 3. Cálculo de Consumo (Diferencia acumulativa)
    const consumoA = Math.abs(lastRecord.kWhA - firstRecord.kWhA) * correctionFactor;
    const consumoB = Math.abs(lastRecord.kWhB - firstRecord.kWhB) * correctionFactor;
    const consumoC = Math.abs(lastRecord.kWhC - firstRecord.kWhC) * correctionFactor;
    
    const totalConsumo = consumoA + consumoB + consumoC;

    // 4. Cálculo de Promedios
    const avgVal = (key) => filteredData.reduce((sum, r) => sum + (r[key] || 0), 0) / filteredData.length;

    // 5. Cálculos Monetarios (Según Tarifa Seleccionada)
    const costoEnergia = totalConsumo * rates.energia;
    const subtotal = costoEnergia + rates.suministro; 
    const iva = subtotal * rates.iva;
    const dacCost = subtotal * rates.dap;
    const totalPagar = subtotal + iva + dacCost;

    // 6. Retornar estructura
    return {
      success: true,
      buildingName,
      deviceId: buildingId,
      periodo: {
        inicio: startDate,
        fin: endDate,
        dias: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1
      },
      totalRegistros: filteredData.length,
      valoresActuales: {
        timestamp: lastRecord.timestamp,
        voltajes: { faseA: lastRecord.V_RMSA, faseB: lastRecord.V_RMSB, faseC: lastRecord.V_RMSC },
        corrientes: { faseA: lastRecord.I_RMSA, faseB: lastRecord.I_RMSB, faseC: lastRecord.I_RMSC }
      },
      consumo: {
        total: totalConsumo,
        inicial: (firstRecord.kWhA + firstRecord.kWhB + firstRecord.kWhC),
        final: (lastRecord.kWhA + lastRecord.kWhB + lastRecord.kWhC),
        faseA: consumoA,
        faseB: consumoB,
        faseC: consumoC
      },
      promedios: {
        voltajes: { faseA: avgVal('V_RMSA'), faseB: avgVal('V_RMSB'), faseC: avgVal('V_RMSC') },
        corrientes: { faseA: avgVal('I_RMSA'), faseB: avgVal('I_RMSB'), faseC: avgVal('I_RMSC') },
        potencias: {
            faseA: avgVal('PPROM_A'),
            faseB: avgVal('PPROM_B'),
            faseC: avgVal('PPROM_C'),
            total: avgVal('PPROM_A') + avgVal('PPROM_B') + avgVal('PPROM_C')
        }
      },
      costos: {
        tarifaNombre: selectedTariff.name,
        tarifaPorKwh: rates.energia,
        cargoSuministro: rates.suministro,
        subtotalEnergia: subtotal,
        iva: iva,
        dac: dacCost,
        total: totalPagar
      }
    };

  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, message: "Error de cálculo: " + error.toString() };
  }
};

export default {
  getDateRanges,
  generateReport,
  TARIFF_SCHEMES // Exportamos para uso en UI
};