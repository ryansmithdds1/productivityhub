import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to serialize BigInt
const serialize = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
};

export async function GET() {
    try {
        const exercises = await prisma.exercise.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(serialize(exercises));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, defaultSets, defaultReps } = body;

        const exercise = await prisma.exercise.create({
            data: {
                name,
                category,
                defaultSets: defaultSets || 3,
                defaultReps: defaultReps || 10,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        });

        return NextResponse.json(serialize(exercise));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
    }
}
