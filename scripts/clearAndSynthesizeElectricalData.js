// scripts/clearAndSynthesizeElectricalData.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAndSynthesize() {
  try {
    // 1. Cuenta todos los registros detallados (no sintetizados).
    const total = await prisma.electricalData.count({
      where: { isSynthesized: false }
    });

    console.log(`Total registros no sintetizados: ${total}`);

    if (total <= 100) {
      console.log('✅ Hay 100 o menos, no es necesario sintetizar.');
      return;
    }

    // 2. Calcula cuántos registros hay que sintetizar
    const excess = total - 100;

    // 3. Toma los registros más antiguos (ascending por timestamp)
    const oldRecords = await prisma.electricalData.findMany({
      where: { isSynthesized: false },
      orderBy: { timestamp: 'asc' },
      take: excess
    });

    // 4. Calcula los promedios de cada campo
    const avg = field =>
      oldRecords.reduce((sum, r) => sum + Number(r[field] || 0), 0) /
      oldRecords.length;

    const synthesizedRecord = await prisma.electricalData.create({
      data: {
        timestamp: new Date(),
        I_RMSA: avg('I_RMSA'),
        I_RMSB: avg('I_RMSB'),
        I_RMSC: avg('I_RMSC'),
        V_RMSA: avg('V_RMSA'),
        V_RMSB: avg('V_RMSB'),
        V_RMSC: avg('V_RMSC'),
        V_RMSAB: avg('V_RMSAB'),
        V_RMSBC: avg('V_RMSBC'),
        V_RMSCA: avg('V_RMSCA'),
        kWhA: avg('kWhA'),
        kWhB: avg('kWhB'),
        kWhC: avg('kWhC'),
        PPROM_A: avg('PPROM_A'),
        PPROM_B: avg('PPROM_B'),
        PPROM_C: avg('PPROM_C'),
        isSynthesized: true,
        // Si tienes buildingId en esos registros, 
        // toma el primero como ejemplo:
        buildingId: oldRecords[0].buildingId || null,
      }
    });

    console.log(`✅ Registro sintetizado creado (ID ${synthesizedRecord.id})`);

    // 5. Elimina los registros antiguos sintetizados
    const idsToDelete = oldRecords.map(r => r.id);

    const del = await prisma.electricalData.deleteMany({
      where: { id: { in: idsToDelete } }
    });

    console.log(`🗑️  Eliminados ${del.count} registros antiguos.`);

  } catch (err) {
    console.error('❌ Error en sintetizar y limpiar:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSynthesize();
