import { supabase } from '../../lib/supabase';

/**
 * Servicio para generar reportes de consumo eléctrico
 * Basado en las tablas ElectricalData y MonthlyElectricalData
 * 
 * IMPORTANTE: Los datos del Photon vienen en formato INSTANTÁNEO:
 * - kWhA/B/C: Consumo por segundo (NO acumulativo)
 * - PPROM_A/B/C: Potencia en Watts
 * - Los valores pueden ser negativos debido al sensor
 * 
 * Esta implementación:
 * 1. SUMA todos los valores kWh del periodo (en lugar de diferencia)
 * 2. Usa Math.abs() para manejar valores negativos
 * 3. Convierte potencias de W a kW para visualización
 */

export const reportService = {
  /**
   * Obtener datos históricos del periodo
   * @param {string} deviceId - ID del dispositivo
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @param {number} limit - Límite de registros (opcional)
   */
  async getHistoricalData(deviceId, startDate, endDate, limit = null) {
    try {
      let query = supabase
        .from('ElectricalData')
        .select('*')
        .eq('device_id', deviceId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching historical data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getHistoricalData:', error);
      return [];
    }
  },

  /**
   * Obtener datos mensuales agregados
   * @param {string} deviceId - ID del dispositivo
   * @param {number} year - Año
   * @param {number} month - Mes (1-12)
   */
  async getMonthlyData(deviceId, year, month) {
    try {
      const { data, error } = await supabase
        .from('MonthlyElectricalData')
        .select('*')
        .eq('device_id', deviceId)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (error) {
        console.error('Error fetching monthly data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getMonthlyData:', error);
      return null;
    }
  },

  /**
   * Calcular estadísticas del periodo basadas en datos históricos
   * 
   * IMPORTANTE - COMPORTAMIENTO DEL PHOTON:
   * - El Photon envía valores kWh ACUMULATIVOS (crecientes desde que se enciende)
   * - Para calcular consumo del periodo: ultimaLectura - primeraLectura
   * - Si el Photon se reinició, los valores pueden "resetear" a valores bajos
   * 
   * @param {Array} historicalData - Array de datos históricos
   * @param {number} correctionFactor - Factor de corrección si los datos están mal escalados
   * @param {boolean} useAccumulativeMode - true si los datos son acumulativos, false si son instantáneos
   */
  calculatePeriodStatistics(historicalData, correctionFactor = 1.0, useAccumulativeMode = true) {
    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    const count = historicalData.length;
    
    // Ordenar por timestamp para cálculos correctos
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const firstReading = sortedData[0];
    const lastReading = sortedData[sortedData.length - 1];

    let consumoFaseA, consumoFaseB, consumoFaseC, consumoTotal;
    
    if (useAccumulativeMode) {
      // MODO ACUMULATIVO: Diferencia entre última y primera lectura
      console.log('📊 Modo ACUMULATIVO activado');
      consumoFaseA = Math.abs(lastReading.kWhA - firstReading.kWhA) * correctionFactor;
      consumoFaseB = Math.abs(lastReading.kWhB - firstReading.kWhB) * correctionFactor;
      consumoFaseC = Math.abs(lastReading.kWhC - firstReading.kWhC) * correctionFactor;
      consumoTotal = consumoFaseA + consumoFaseB + consumoFaseC;
      
      console.log(`   Primera lectura: A=${firstReading.kWhA.toFixed(6)} B=${firstReading.kWhB.toFixed(6)} C=${firstReading.kWhC.toFixed(6)}`);
      console.log(`   Última lectura:  A=${lastReading.kWhA.toFixed(6)} B=${lastReading.kWhB.toFixed(6)} C=${lastReading.kWhC.toFixed(6)}`);
    } else {
      // MODO INSTANTÁNEO: Suma de todos los valores
      console.log('📊 Modo INSTANTÁNEO activado');
      consumoFaseA = historicalData.reduce((sum, d) => sum + Math.abs(d.kWhA || 0), 0) * correctionFactor;
      consumoFaseB = historicalData.reduce((sum, d) => sum + Math.abs(d.kWhB || 0), 0) * correctionFactor;
      consumoFaseC = historicalData.reduce((sum, d) => sum + Math.abs(d.kWhC || 0), 0) * correctionFactor;
      consumoTotal = consumoFaseA + consumoFaseB + consumoFaseC;
    }

    console.log(`📊 Cálculo de consumo:`);
    console.log(`   - Registros procesados: ${count}`);
    console.log(`   - Factor de corrección: ${correctionFactor}`);
    console.log(`   - Consumo Fase A: ${consumoFaseA.toFixed(3)} kWh`);
    console.log(`   - Consumo Fase B: ${consumoFaseB.toFixed(3)} kWh`);
    console.log(`   - Consumo Fase C: ${consumoFaseC.toFixed(3)} kWh`);
    console.log(`   - Consumo TOTAL: ${consumoTotal.toFixed(3)} kWh`);

    // Calcular promedios de voltajes (deben estar cerca de 127V)
    const avgVoltageA = historicalData.reduce((sum, d) => sum + Math.abs(d.V_RMSA || 0), 0) / count;
    const avgVoltageB = historicalData.reduce((sum, d) => sum + Math.abs(d.V_RMSB || 0), 0) / count;
    const avgVoltageC = historicalData.reduce((sum, d) => sum + Math.abs(d.V_RMSC || 0), 0) / count;
    
    // Calcular promedios de corrientes
    const avgCurrentA = historicalData.reduce((sum, d) => sum + Math.abs(d.I_RMSA || 0), 0) / count;
    const avgCurrentB = historicalData.reduce((sum, d) => sum + Math.abs(d.I_RMSB || 0), 0) / count;
    const avgCurrentC = historicalData.reduce((sum, d) => sum + Math.abs(d.I_RMSC || 0), 0) / count;
    
    // Calcular promedios de potencias (convertir W a kW)
    const avgPowerA = historicalData.reduce((sum, d) => sum + Math.abs(d.PPROM_A || 0), 0) / count / 1000;
    const avgPowerB = historicalData.reduce((sum, d) => sum + Math.abs(d.PPROM_B || 0), 0) / count / 1000;
    const avgPowerC = historicalData.reduce((sum, d) => sum + Math.abs(d.PPROM_C || 0), 0) / count / 1000;
    const avgPowerTotal = avgPowerA + avgPowerB + avgPowerC;

    // Calcular valores máximos y mínimos (usando valor absoluto)
    const maxVoltageA = Math.max(...historicalData.map(d => Math.abs(d.V_RMSA || 0)));
    const minVoltageA = Math.min(...historicalData.map(d => Math.abs(d.V_RMSA || 0)));
    const maxCurrentA = Math.max(...historicalData.map(d => Math.abs(d.I_RMSA || 0)));
    const maxPowerTotal = Math.max(...historicalData.map(d => 
      Math.abs(d.PPROM_A || 0) + Math.abs(d.PPROM_B || 0) + Math.abs(d.PPROM_C || 0)
    )) / 1000; // Convertir a kW

    // Obtener última lectura para valores actuales (ya tenemos lastReading arriba)
    const currentValues = lastReading;

    return {
      totalRegistros: count,
      consumo: {
        faseA: consumoFaseA,
        faseB: consumoFaseB,
        faseC: consumoFaseC,
        total: consumoTotal,
      },
      promedios: {
        voltajes: {
          faseA: avgVoltageA,
          faseB: avgVoltageB,
          faseC: avgVoltageC,
        },
        corrientes: {
          faseA: avgCurrentA,
          faseB: avgCurrentB,
          faseC: avgCurrentC,
        },
        potencias: {
          faseA: avgPowerA,
          faseB: avgPowerB,
          faseC: avgPowerC,
          total: avgPowerTotal,
        },
      },
      maximos: {
        voltajeA: maxVoltageA,
        corrienteA: maxCurrentA,
        potenciaTotal: maxPowerTotal,
      },
      minimos: {
        voltajeA: minVoltageA,
      },
      valoresActuales: {
        voltajes: {
          faseA: Math.abs(currentValues.V_RMSA || 0),
          faseB: Math.abs(currentValues.V_RMSB || 0),
          faseC: Math.abs(currentValues.V_RMSC || 0),
        },
        corrientes: {
          faseA: Math.abs(currentValues.I_RMSA || 0),
          faseB: Math.abs(currentValues.I_RMSB || 0),
          faseC: Math.abs(currentValues.I_RMSC || 0),
        },
        potencias: {
          faseA: Math.abs(currentValues.PPROM_A || 0) / 1000, // Convertir W a kW
          faseB: Math.abs(currentValues.PPROM_B || 0) / 1000,
          faseC: Math.abs(currentValues.PPROM_C || 0) / 1000,
        },
        timestamp: currentValues.timestamp,
      },
    };
  },

  /**
   * Calcular costos estimados CFE
   * @param {number} consumoTotalKwh - Consumo total en kWh
   * @param {object} tarifaConfig - Configuración de tarifa (opcional)
   */
  calculateCFECosts(consumoTotalKwh, tarifaConfig = null) {
    // Tarifa DAC promedio (ajustable según región y tipo de contrato)
    const config = tarifaConfig || {
      tarifaBase: 2.50, // $/kWh
      iva: 0.16, // 16%
      dac: 0.03, // 3% (Derecho de Alumbrado Público)
    };

    const subtotalEnergia = consumoTotalKwh * config.tarifaBase;
    const iva = subtotalEnergia * config.iva;
    const dac = subtotalEnergia * config.dac;
    const total = subtotalEnergia + iva + dac;

    return {
      consumoTotal: consumoTotalKwh,
      tarifaPorKwh: config.tarifaBase,
      subtotalEnergia,
      iva,
      dac,
      total,
      desglose: {
        energia: subtotalEnergia,
        impuestos: iva + dac,
      },
    };
  },

  /**
   * Generar reporte completo para un periodo
   * @param {string} deviceId - ID del dispositivo
   * @param {string} buildingName - Nombre del edificio
   * @param {Date} startDate - Fecha inicio
   * @param {Date} endDate - Fecha fin
   * @param {number} maxRecords - Máximo de registros a consultar (default: 10000)
   * @param {number} correctionFactor - Factor para corregir escala de datos (default: 1.0)
   *                                    Usa 0.01 si los valores parecen 100x más grandes
   *                                    Usa 0.001 si los valores parecen 1000x más grandes
   *                                    Usa 1.0 si los valores son correctos
   * @param {boolean} useAccumulativeMode - true si kWh son acumulativos, false si son instantáneos (default: true)
   */
  async generateReport(deviceId, buildingName, startDate, endDate, maxRecords = 10000, correctionFactor = 1.0, useAccumulativeMode = true) {
    try {
      // Obtener datos históricos con límite para evitar sobrecarga
      const historicalData = await this.getHistoricalData(deviceId, startDate, endDate, maxRecords);

      if (!historicalData || historicalData.length === 0) {
        return {
          success: false,
          message: 'No hay datos disponibles para el periodo seleccionado',
        };
      }

      // Advertir si se alcanzó el límite
      if (historicalData.length === maxRecords) {
        console.warn(`⚠️ Se alcanzó el límite de ${maxRecords} registros. Algunos datos pueden no estar incluidos.`);
      }

      console.log(`📊 Procesando ${historicalData.length} registros para el reporte`);
      console.log(`🔧 Factor de corrección: ${correctionFactor}`);
      console.log(`📈 Modo: ${useAccumulativeMode ? 'ACUMULATIVO' : 'INSTANTÁNEO'}`);

      // Calcular estadísticas con parámetros configurables
      const statistics = this.calculatePeriodStatistics(historicalData, correctionFactor, useAccumulativeMode);

      // Calcular costos CFE
      const costos = this.calculateCFECosts(statistics.consumo.total);

      // Calcular duración del periodo
      const diasPeriodo = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      return {
        success: true,
        buildingName,
        deviceId,
        periodo: {
          inicio: startDate,
          fin: endDate,
          dias: diasPeriodo,
        },
        ...statistics,
        costos,
        limitAlcanzado: historicalData.length === maxRecords,
        maxRecords: maxRecords,
        generadoEn: new Date(),
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        message: 'Error al generar el reporte',
        error: error.message,
      };
    }
  },

  /**
   * Obtener rangos de fechas predefinidos
   */
  getDateRanges() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      hoy: {
        label: 'Hoy',
        startDate: startOfToday,
        endDate: now,
      },
      ayer: {
        label: 'Ayer',
        startDate: startOfYesterday,
        endDate: startOfToday,
      },
      ultimos7dias: {
        label: 'Últimos 7 días',
        startDate: startOfWeek,
        endDate: now,
      },
      mesActual: {
        label: 'Mes actual',
        startDate: startOfMonth,
        endDate: now,
      },
      mesAnterior: {
        label: 'Mes anterior',
        startDate: startOfLastMonth,
        endDate: endOfLastMonth,
      },
    };
  },

  /**
   * Comparar dos periodos
   * @param {string} deviceId - ID del dispositivo
   * @param {Date} period1Start - Inicio periodo 1
   * @param {Date} period1End - Fin periodo 1
   * @param {Date} period2Start - Inicio periodo 2
   * @param {Date} period2End - Fin periodo 2
   */
  async comparePeriodsAsync(deviceId, period1Start, period1End, period2Start, period2End) {
    const [data1, data2] = await Promise.all([
      this.getHistoricalData(deviceId, period1Start, period1End),
      this.getHistoricalData(deviceId, period2Start, period2End),
    ]);

    const stats1 = data1.length > 0 ? this.calculatePeriodStatistics(data1) : null;
    const stats2 = data2.length > 0 ? this.calculatePeriodStatistics(data2) : null;

    if (!stats1 || !stats2) {
      return null;
    }

    const consumoDiff = stats1.consumo.total - stats2.consumo.total;
    const consumoDiffPercent = ((consumoDiff / stats2.consumo.total) * 100).toFixed(2);

    return {
      periodo1: {
        inicio: period1Start,
        fin: period1End,
        consumo: stats1.consumo.total,
      },
      periodo2: {
        inicio: period2Start,
        fin: period2End,
        consumo: stats2.consumo.total,
      },
      diferencia: {
        absoluta: consumoDiff,
        porcentaje: consumoDiffPercent,
        tendencia: consumoDiff > 0 ? 'aumento' : 'disminucion',
      },
    };
  },
};

export default reportService;