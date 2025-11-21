import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to serialize BigInt
const serialize = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category, defaultSets, defaultReps } = body;

        const exercise = await prisma.exercise.update({
            where: { id },
            data: {
                name,
                category,
                defaultSets,
                defaultReps,
                updatedAt: Date.now(),
            }
        });

        return NextResponse.json(serialize(exercise));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.exercise.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
    }
}
