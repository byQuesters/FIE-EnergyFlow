// app/api/get-data/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener los datos más recientes de la base de datos
    const latestData = await prisma.electricalData.findFirst({
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        building: true
      }
    });

    // Para datos históricos, obtener una mezcla inteligente:
    // - Últimos 10 registros sin síntesis (tiempo real)
    // - Datos sintetizados más antiguos para tendencias
    
    const recentRealTime = await prisma.electricalData.findMany({
      where: {
        synthesized: false
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20, // Últimos 20 puntos en tiempo real
      include: {
        building: true
      }
    });

    const synthesizedHistorical = await prisma.electricalData.findMany({
      where: {
        synthesized: true,
        timestamp: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // Más de 1 hora atrás
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 30, // 30 puntos sintetizados para tendencias históricas
      include: {
        building: true
      }
    });

    // Combinar y ordenar todos los datos históricos
    const allHistorical = [...recentRealTime, ...synthesizedHistorical]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50); // Limitar a 50 puntos totales

    // Si no hay datos, devolver valores por defecto
    if (!latestData) {
      return NextResponse.json({
        latestData: {
          I_RMSA: 0,
          I_RMSB: 0,
          I_RMSC: 0,
          V_RMSA: 0,
          V_RMSB: 0,
          V_RMSC: 0,
          V_RMSAB: 0,
          V_RMSBC: 0,
          V_RMSCA: 0,
          kWhA: 0,
          kWhB: 0,
          kWhC: 0,
          PPROM_A: 0,
          PPROM_B: 0,
          PPROM_C: 0,
          timestamp: new Date().toISOString()
        },
        historical: [],
        realtimePoints: 0,
        synthesizedPoints: 0
      });
    }

    // Formatear los datos para el dashboard
    const formattedLatestData = {
      I_RMSA: latestData.I_RMSA || 0,
      I_RMSB: latestData.I_RMSB || 0,
      I_RMSC: latestData.I_RMSC || 0,
      V_RMSA: latestData.V_RMSA || 0,
      V_RMSB: latestData.V_RMSB || 0,
      V_RMSC: latestData.V_RMSC || 0,
      V_RMSAB: latestData.V_RMSAB || 0,
      V_RMSBC: latestData.V_RMSBC || 0,
      V_RMSCA: latestData.V_RMSCA || 0,
      kWhA: latestData.kWhA || 0,
      kWhB: latestData.kWhB || 0,
      kWhC: latestData.kWhC || 0,
      PPROM_A: latestData.PPROM_A || 0,
      PPROM_B: latestData.PPROM_B || 0,
      PPROM_C: latestData.PPROM_C || 0,
      timestamp: latestData.timestamp.toISOString()
    };

    const formattedHistorical = allHistorical.map(data => ({
      I_RMSA: data.I_RMSA || 0,
      I_RMSB: data.I_RMSB || 0,
      I_RMSC: data.I_RMSC || 0,
      V_RMSA: data.V_RMSA || 0,
      V_RMSB: data.V_RMSB || 0,
      V_RMSC: data.V_RMSC || 0,
      V_RMSAB: data.V_RMSAB || 0,
      V_RMSBC: data.V_RMSBC || 0,
      V_RMSCA: data.V_RMSCA || 0,
      kWhA: data.kWhA || 0,
      kWhB: data.kWhB || 0,
      kWhC: data.kWhC || 0,
      PPROM_A: data.PPROM_A || 0,
      PPROM_B: data.PPROM_B || 0,
      PPROM_C: data.PPROM_C || 0,
      timestamp: data.timestamp.toISOString(),
      isSynthesized: data.synthesized || false
    }));

    return NextResponse.json({
      latestData: formattedLatestData,
      historical: formattedHistorical,
      realtimePoints: recentRealTime.length,
      synthesizedPoints: synthesizedHistorical.length,
      totalPoints: allHistorical.length
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Error al obtener los datos' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}