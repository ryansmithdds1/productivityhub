import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        const metric = await prisma.healthMetric.findUnique({
            where: {
                date: date,
            },
        });

        return NextResponse.json(metric || {});
    } catch (error) {
        console.error('Error fetching health metrics:', error);
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { date, ...metrics } = body;

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const metric = await prisma.healthMetric.upsert({
            where: {
                date: date,
            },
            update: {
                ...metrics,
                updatedAt: BigInt(Date.now()),
            },
            create: {
                date: date,
                ...metrics,
                createdAt: BigInt(Date.now()),
                updatedAt: BigInt(Date.now()),
            },
        });

        // Convert BigInt to string for JSON serialization
        const serializedMetric = JSON.parse(JSON.stringify(metric, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(serializedMetric);
    } catch (error) {
        console.error('Error saving health metrics:', error);
        return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 });
    }
}
