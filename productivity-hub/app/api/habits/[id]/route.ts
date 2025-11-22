import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, color, icon } = body;

        const habit = await prisma.habit.update({
            where: { id },
            data: {
                name,
                description,
                color,
                icon,
                updatedAt: BigInt(Date.now()),
            }
        });

        return NextResponse.json({
            ...habit,
            createdAt: Number(habit.createdAt),
            updatedAt: Number(habit.updatedAt),
        });
    } catch (error) {
        console.error('Error updating habit:', error);
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.habit.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
