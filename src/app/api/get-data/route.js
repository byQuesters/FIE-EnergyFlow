import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const latestData = await prisma.electricalData.findFirst({
      orderBy: { timestamp: 'desc' }
    })

    const historicalData = await prisma.electricalData.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' }
    })

    return NextResponse.json({
      latestData: {
        ...latestData,
        timestamp: latestData?.timestamp?.toISOString() ?? null
      },
      historical: historicalData.map(item => ({
        ...item,
        timestamp: item.timestamp.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
