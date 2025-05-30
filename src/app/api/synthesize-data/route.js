// app/api/synthesize-data/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Iniciando proceso de síntesis de datos...');

    // Obtener la fecha límite (hace 1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Obtener todos los datos anteriores a 1 hora que no están sintetizados
    const dataToSynthesize = await prisma.electricalData.findMany({
      where: {
        timestamp: {
          lt: oneHourAgo
        },
        synthesized: false
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    if (dataToSynthesize.length === 0) {
      console.log('No hay datos para sintetizar');
      return NextResponse.json({ message: 'No hay datos para sintetizar', count: 0 });
    }

    console.log(`Encontrados ${dataToSynthesize.length} registros para sintetizar`);

    // Agrupar datos por intervalos de 10 minutos
    const groupedData = {};
    
    dataToSynthesize.forEach(data => {
      // Redondear a intervalos de 10 minutos
      const intervalStart = new Date(data.timestamp);
      intervalStart.setMinutes(Math.floor(intervalStart.getMinutes() / 10) * 10, 0, 0);
      const intervalKey = intervalStart.toISOString();

      if (!groupedData[intervalKey]) {
        groupedData[intervalKey] = [];
      }
      groupedData[intervalKey].push(data);
    });

    let synthesizedCount = 0;
    const synthesizedRecords = [];

    // Crear registros sintetizados para cada grupo
    for (const [intervalKey, records] of Object.entries(groupedData)) {
      if (records.length === 1) {
        // Si solo hay un registro, marcarlo como sintetizado
        await prisma.electricalData.update({
          where: { id: records[0].id },
          data: { synthesized: true }
        });
        continue;
      }

      // Calcular promedios
      const avgData = {
        I_RMSA: records.reduce((sum, r) => sum + (r.I_RMSA || 0), 0) / records.length,
        I_RMSB: records.reduce((sum, r) => sum + (r.I_RMSB || 0), 0) / records.length,
        I_RMSC: records.reduce((sum, r) => sum + (r.I_RMSC || 0), 0) / records.length,
        V_RMSA: records.reduce((sum, r) => sum + (r.V_RMSA || 0), 0) / records.length,
        V_RMSB: records.reduce((sum, r) => sum + (r.V_RMSB || 0), 0) / records.length,
        V_RMSC: records.reduce((sum, r) => sum + (r.V_RMSC || 0), 0) / records.length,
        V_RMSAB: records.reduce((sum, r) => sum + (r.V_RMSAB || 0), 0) / records.length,
        V_RMSBC: records.reduce((sum, r) => sum + (r.V_RMSBC || 0), 0) / records.length,
        V_RMSCA: records.reduce((sum, r) => sum + (r.V_RMSCA || 0), 0) / records.length,
        PPROM_A: records.reduce((sum, r) => sum + (r.PPROM_A || 0), 0) / records.length,
        PPROM_B: records.reduce((sum, r) => sum + (r.PPROM_B || 0), 0) / records.length,
        PPROM_C: records.reduce((sum, r) => sum + (r.PPROM_C || 0), 0) / records.length,
        // Para kWh, tomar el máximo (son valores acumulativos)
        kWhA: Math.max(...records.map(r => r.kWhA || 0)),
        kWhB: Math.max(...records.map(r => r.kWhB || 0)),
        kWhC: Math.max(...records.map(r => r.kWhC || 0)),
        buildingId: records[0].buildingId,
        timestamp: new Date(intervalKey),
        synthesized: true,
        originalCount: records.length
      };

      // Crear registro sintetizado
      const synthesizedRecord = await prisma.electricalData.create({
        data: avgData
      });

      synthesizedRecords.push(synthesizedRecord);

      // Eliminar registros originales
      const recordIds = records.map(r => r.id);
      await prisma.electricalData.deleteMany({
        where: {
          id: {
            in: recordIds
          }
        }
      });

      synthesizedCount += records.length;
    }

    console.log(`Síntesis completada: ${synthesizedCount} registros procesados, ${synthesizedRecords.length} registros sintetizados creados`);

    return NextResponse.json({
      message: 'Síntesis completada exitosamente',
      processedRecords: synthesizedCount,
      synthesizedRecords: synthesizedRecords.length,
      details: synthesizedRecords.map(r => ({
        timestamp: r.timestamp,
        originalCount: r.originalCount
      }))
    });

  } catch (error) {
    console.error('Error en síntesis de datos:', error);
    return NextResponse.json(
      { error: 'Error al sintetizar datos', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}