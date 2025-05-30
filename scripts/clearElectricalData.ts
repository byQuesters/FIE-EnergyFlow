import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearElectricalData() {
  try {
    const deleted = await prisma.electricalData.deleteMany({});
    console.log(`✅ Se eliminaron ${deleted.count} registros de la tabla ElectricalData.`);
  } catch (error) {
    console.error('❌ Error eliminando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearElectricalData();
