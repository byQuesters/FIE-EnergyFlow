import { NextResponse } from 'next/server'
import Particle from 'particle-api-js'
import prisma from '@/lib/db'

export async function POST() {
  try {
    const particle = new Particle()
    const deviceId = process.env.PARTICLE_DEVICE_ID
    const token = process.env.PARTICLE_TOKEN

    const response = await particle.getVariable({
      deviceId,
      name: 'variables', // Cambia a un endpoint válido si el firmware no soporta múltiples variables
      auth: token
    })

    const vars = response.body

    const savedData = await prisma.electricalData.create({
      data: {
        I_RMSA: parseFloat(vars.I_rmsA),
        I_RMSB: parseFloat(vars.I_rmsB),
        I_RMSC: parseFloat(vars.I_rmsC),
        V_RMSA: parseFloat(vars.V_rmsA),
        V_RMSB: parseFloat(vars.V_rmsB),
        V_RMSC: parseFloat(vars.V_rmsC),
        V_RMSAB: parseFloat(vars.V_rmsAB),
        V_RMSBC: parseFloat(vars.V_rmsBC),
        V_RMSCA: parseFloat(vars.V_rmsCA),
        kWhA: parseFloat(vars.KWHA),
        kWhB: parseFloat(vars.KWHB),
        kWhC: parseFloat(vars.KWHC),
        PPROM_A: parseFloat(vars.PA),
        PPROM_B: parseFloat(vars.PB),
        PPROM_C: parseFloat(vars.PC)
      }
    })

    return NextResponse.json({
      ...savedData,
      timestamp: savedData.timestamp.toISOString()
    })
  } catch (error) {
    console.error('Error saving data:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
