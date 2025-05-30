// /scripts/seed.ts (crear este archivo si no existe)
import prisma from '@/lib/db'

async function main() {
  await prisma.building.create({
    data: {
      name: 'Edificio Principal',
      deviceId: 'tu-device-id',
    },
  })
}

main().then(() => {
  console.log('✔ Edificio insertado')
  process.exit(0)
})
