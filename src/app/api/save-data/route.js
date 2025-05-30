// app/api/save-data/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Mapeo de variables del sensor a nombres de la base de datos
const variableMapping = {
  'I_rmsA': 'I_RMSA',
  'I_rmsB': 'I_RMSB', 
  'I_rmsC': 'I_RMSC',
  'V_rmsA': 'V_RMSA',
  'V_rmsB': 'V_RMSB',
  'V_rmsC': 'V_RMSC',
  'V_rmsAB': 'V_RMSAB',
  'V_rmsBC': 'V_RMSBC',
  'V_rmsCA': 'V_RMSCA',
  'KWHA': 'kWhA',
  'KWHB': 'kWhB',
  'KWHC': 'kWhC',
  'PA': 'PPROM_A',
  'PB': 'PPROM_B',
  'PC': 'PPROM_C'
};

const variables = [
  'I_rmsA', 'I_rmsB', 'I_rmsC',
  'V_rmsA', 'V_rmsB', 'V_rmsC',
  'V_rmsAB', 'V_rmsBC', 'V_rmsCA',
  'KWHA', 'KWHB', 'KWHC',
  'PA', 'PB', 'PC'
];

async function getParticleVariable(deviceId, token, varName) {
  const url = `https://api.particle.io/v1/devices/${deviceId}/${varName}?access_token=${token}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { name: varName, value: parseFloat(data.result) || 0 };
  } catch (err) {
    console.error(`Error al leer ${varName}:`, err.message);
    return { name: varName, value: 0, error: err.message };
  }
}

async function getAllParticleData(deviceId, token) {
  const results = await Promise.all(
    variables.map(varName => getParticleVariable(deviceId, token, varName))
  );
  
  const data = {};
  results.forEach(result => {
    const dbFieldName = variableMapping[result.name];
    if (dbFieldName) {
      data[dbFieldName] = result.value;
    }
  });
  
  return data;
}

// Variable para controlar el último proceso de síntesis
let lastSynthesisCheck = Date.now();
const SYNTHESIS_INTERVAL = 30 * 60 * 1000; // 30 minutos

export async function POST() {
  try {
    const deviceId = process.env.PARTICLE_DEVICE_ID;
    const token = process.env.PARTICLE_TOKEN;

    if (!deviceId || !token) {
      return NextResponse.json(
        { error: 'Credenciales de Particle no configuradas' },
        { status: 500 }
      );
    }

    // Obtener datos del sensor Particle
    const sensorData = await getAllParticleData(deviceId, token);
    
    // Buscar o crear un building por defecto
    let building = await prisma.building.findFirst({
      where: {
        particleDeviceId: deviceId
      }
    });

    if (!building) {
      building = await prisma.building.create({
        data: {
          name: 'Edificio Principal',
          deviceId: deviceId,
          particleToken: token,
          particleDeviceId: deviceId
        }
      });
    }

    // Guardar los datos en la base de datos (siempre como no sintetizados inicialmente)
    const electricalData = await prisma.electricalData.create({
      data: {
        ...sensorData,
        buildingId: building.id,
        timestamp: new Date(),
        synthesized: false // Marcar como no sintetizado
      }
    });

    // Verificar si es hora de ejecutar síntesis (cada 30 minutos)
    const now = Date.now();
    if (now - lastSynthesisCheck >= SYNTHESIS_INTERVAL) {
      lastSynthesisCheck = now;
      
      // Ejecutar síntesis en background (no bloquear la respuesta)
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/synthesize-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error('Error en síntesis automática:', err));
    }

    // Formatear datos para el dashboard (manteniendo la estructura que espera)
    const formattedData = {
      I_RMSA: sensorData.I_RMSA || 0,
      I_RMSB: sensorData.I_RMSB || 0,
      I_RMSC: sensorData.I_RMSC || 0,
      V_RMSA: sensorData.V_RMSA || 0,
      V_RMSB: sensorData.V_RMSB || 0,
      V_RMSC: sensorData.V_RMSC || 0,
      V_RMSAB: sensorData.V_RMSAB || 0,
      V_RMSBC: sensorData.V_RMSBC || 0,
      V_RMSCA: sensorData.V_RMSCA || 0,
      kWhA: sensorData.kWhA || 0,
      kWhB: sensorData.kWhB || 0,
      kWhC: sensorData.kWhC || 0,
      PPROM_A: sensorData.PPROM_A || 0,
      PPROM_B: sensorData.PPROM_B || 0,
      PPROM_C: sensorData.PPROM_C || 0,
      timestamp: electricalData.timestamp.toISOString()
    };

    console.log('Datos guardados exitosamente:', {
      timestamp: formattedData.timestamp,
      totalPower: Math.abs(formattedData.PPROM_A) + Math.abs(formattedData.PPROM_B) + Math.abs(formattedData.PPROM_C)
    });

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error al guardar datos:', error);
    return NextResponse.json(
      { error: 'Error al obtener y guardar los datos' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}