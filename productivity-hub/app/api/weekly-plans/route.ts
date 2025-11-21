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
        const plans = await prisma.weeklyPlan.findMany({
            orderBy: { weekOf: 'desc' },
            take: 10
        });
        return NextResponse.json(serialize(plans));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weekly plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { weekOf, reflections, goals, roadblocks, commitment, status } = body;

        const plan = await prisma.weeklyPlan.create({
            data: {
                weekOf: weekOf || Date.now(),
                status: status || 'in-progress',
                reflections: reflections || null,
                goals: goals || null,
                roadblocks,
                commitment,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                completedAt: status === 'completed' ? Date.now() : null
            }
        });

        return NextResponse.json(serialize(plan));
    } catch (error) {
        console.error('Error creating weekly plan:', error);
        return NextResponse.json({ error: 'Failed to create weekly plan' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, reflections, goals, roadblocks, commitment, status } = body;

        const updateData: any = {
            updatedAt: Date.now()
        };

        if (reflections !== undefined) updateData.reflections = reflections;
        if (goals !== undefined) updateData.goals = goals;
        if (roadblocks !== undefined) updateData.roadblocks = roadblocks;
        if (commitment !== undefined) updateData.commitment = commitment;
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'completed') {
                updateData.completedAt = Date.now();
            }
        }

        const plan = await prisma.weeklyPlan.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(serialize(plan));
    } catch (error) {
        console.error('Error updating weekly plan:', error);
        return NextResponse.json({ error: 'Failed to update weekly plan' }, { status: 500 });
    }
}
