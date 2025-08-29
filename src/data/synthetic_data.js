// Generador de datos sintéticos para simular sensores eléctricos
export class SyntheticDataGenerator {
  constructor() {
    this.baseValues = {
      voltage: {
        A: 220,
        B: 221,
        C: 219,
        AB: 381,
        BC: 382,
        CA: 380
      },
      current: {
        A: 45,
        B: 48,
        C: 43
      },
      power: {
        A: 9.9,
        B: 10.6,
        C: 8.5
      },
      energy: {
        A: 125,
        B: 135,
        C: 109
      }
    };
  }

  // Genera variación aleatoria dentro de un rango
  generateVariation(baseValue, variationPercent = 5) {
    const variation = (Math.random() - 0.5) * 2 * (variationPercent / 100);
    return parseFloat((baseValue * (1 + variation)).toFixed(2));
  }

  // Genera datos en tiempo real
  generateRealTimeData(buildingId) {
    const multiplier = this.getBuildingMultiplier(buildingId);
    
    return {
      timestamp: new Date().toISOString(),
      I_RMSA: this.generateVariation(this.baseValues.current.A * multiplier, 8),
      I_RMSB: this.generateVariation(this.baseValues.current.B * multiplier, 8),
      I_RMSC: this.generateVariation(this.baseValues.current.C * multiplier, 8),
      V_RMSA: this.generateVariation(this.baseValues.voltage.A, 2),
      V_RMSB: this.generateVariation(this.baseValues.voltage.B, 2),
      V_RMSC: this.generateVariation(this.baseValues.voltage.C, 2),
      V_RMSAB: this.generateVariation(this.baseValues.voltage.AB, 2),
      V_RMSBC: this.generateVariation(this.baseValues.voltage.BC, 2),
      V_RMSCA: this.generateVariation(this.baseValues.voltage.CA, 2),
      kWhA: this.generateVariation(this.baseValues.energy.A * multiplier, 10),
      kWhB: this.generateVariation(this.baseValues.energy.B * multiplier, 10),
      kWhC: this.generateVariation(this.baseValues.energy.C * multiplier, 10),
      PPROM_A: this.generateVariation(this.baseValues.power.A * multiplier, 12),
      PPROM_B: this.generateVariation(this.baseValues.power.B * multiplier, 12),
      PPROM_C: this.generateVariation(this.baseValues.power.C * multiplier, 12),
    };
  }

  // Genera datos históricos para un día
  generateHistoricalData(buildingId, date = new Date()) {
    const data = [];
    const multiplier = this.getBuildingMultiplier(buildingId);
    
    for (let hour = 0; hour < 24; hour++) {
      // Simula patrones de consumo diarios
      const timeMultiplier = this.getTimeMultiplier(hour);
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      data.push({
        timestamp: timestamp.toISOString(),
        I_RMSA: this.generateVariation(this.baseValues.current.A * multiplier * timeMultiplier, 15),
        I_RMSB: this.generateVariation(this.baseValues.current.B * multiplier * timeMultiplier, 15),
        I_RMSC: this.generateVariation(this.baseValues.current.C * multiplier * timeMultiplier, 15),
        V_RMSA: this.generateVariation(this.baseValues.voltage.A, 3),
        V_RMSB: this.generateVariation(this.baseValues.voltage.B, 3),
        V_RMSC: this.generateVariation(this.baseValues.voltage.C, 3),
        V_RMSAB: this.generateVariation(this.baseValues.voltage.AB, 3),
        V_RMSBC: this.generateVariation(this.baseValues.voltage.BC, 3),
        V_RMSCA: this.generateVariation(this.baseValues.voltage.CA, 3),
        kWhA: this.generateVariation(this.baseValues.energy.A * multiplier * timeMultiplier, 20),
        kWhB: this.generateVariation(this.baseValues.energy.B * multiplier * timeMultiplier, 20),
        kWhC: this.generateVariation(this.baseValues.energy.C * multiplier * timeMultiplier, 20),
        PPROM_A: this.generateVariation(this.baseValues.power.A * multiplier * timeMultiplier, 18),
        PPROM_B: this.generateVariation(this.baseValues.power.B * multiplier * timeMultiplier, 18),
        PPROM_C: this.generateVariation(this.baseValues.power.C * multiplier * timeMultiplier, 18),
      });
    }
    
    return data;
  }

  // Multiplicador basado en el tipo de edificio
  getBuildingMultiplier(buildingId) {
    const multipliers = {
      1: 0.8,   // Administración - menor consumo
      2: 1.0,   // Aulas - consumo normal
      3: 1.8,   // Laboratorios - alto consumo
      4: 0.4,   // Biblioteca - bajo consumo
      5: 1.3,   // Cafetería - consumo medio-alto
      6: 2.5,   // Gimnasio - muy alto consumo
    };
    
    return multipliers[buildingId] || 1.0;
  }

  // Multiplicador basado en la hora del día
  getTimeMultiplier(hour) {
    // Simula patrones de uso de una escuela
    if (hour >= 0 && hour < 6) return 0.2;    // Madrugada - muy bajo
    if (hour >= 6 && hour < 8) return 0.4;    // Temprano - bajo
    if (hour >= 8 && hour < 12) return 1.0;   // Mañana - normal
    if (hour >= 12 && hour < 14) return 1.2;  // Medio día - alto
    if (hour >= 14 && hour < 18) return 1.1;  // Tarde - medio-alto
    if (hour >= 18 && hour < 22) return 0.8;  // Noche - medio-bajo
    return 0.3;                                // Noche tardía - bajo
  }

  // Genera datos para gráficos
  generateChartData(buildingId, type = 'hourly') {
    if (type === 'hourly') {
      const labels = ['00', '04', '08', '12', '16', '20'];
      const data = labels.map(hour => {
        const multiplier = this.getBuildingMultiplier(buildingId);
        const timeMultiplier = this.getTimeMultiplier(parseInt(hour));
        return this.generateVariation(200 * multiplier * timeMultiplier, 15);
      });

      return {
        labels,
        datasets: [{
          data,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }
    
    if (type === 'phases') {
      const multiplier = this.getBuildingMultiplier(buildingId);
      return {
        labels: ['Fase A', 'Fase B', 'Fase C'],
        datasets: [{
          data: [
            this.generateVariation(85 * multiplier, 10),
            this.generateVariation(92 * multiplier, 10),
            this.generateVariation(78 * multiplier, 10)
          ]
        }]
      };
    }
  }

  // Simula estado del edificio basado en consumo
  getBuildingStatus(buildingId) {
    const currentData = this.generateRealTimeData(buildingId);
    const totalConsumption = currentData.kWhA + currentData.kWhB + currentData.kWhC;
    
    if (totalConsumption < 200) return 'low';
    if (totalConsumption < 400) return 'normal';
    if (totalConsumption < 600) return 'high';
    return 'critical';
  }
}

// Instancia global del generador
export const dataGenerator = new SyntheticDataGenerator();

// Función de utilidad para obtener datos de edificio
export const getBuildingData = (buildingId) => {
  const realTimeData = dataGenerator.generateRealTimeData(buildingId);
  const totalConsumption = realTimeData.kWhA + realTimeData.kWhB + realTimeData.kWhC;
  
  return {
    id: buildingId,
    consumption: parseFloat(totalConsumption.toFixed(1)),
    status: dataGenerator.getBuildingStatus(buildingId),
    realTimeData,
    chartData: {
      hourly: dataGenerator.generateChartData(buildingId, 'hourly'),
      phases: dataGenerator.generateChartData(buildingId, 'phases')
    }
  };
};