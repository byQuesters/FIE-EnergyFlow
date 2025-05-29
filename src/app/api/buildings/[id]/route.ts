// /app/api/buildings/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const building = await prisma.building.findUnique({
      where: { id: params.id },
      include: { electricalData: { take: 1, orderBy: { timestamp: 'desc' } } }
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    return NextResponse.json({ error: 'Failed to fetch building' }, { status: 500 });
  }
}