import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const habits = await prisma.habit.findMany({
            include: {
                logs: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Convert BigInt to number for JSON serialization
        const serializedHabits = habits.map(habit => ({
            ...habit,
            createdAt: Number(habit.createdAt),
            updatedAt: Number(habit.updatedAt),
        }));

        return NextResponse.json(serializedHabits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, color, icon } = body;

        const habit = await prisma.habit.create({
            data: {
                name,
                description,
                color: color || 'green',
                icon,
                createdAt: BigInt(Date.now()),
                updatedAt: BigInt(Date.now()),
            }
        });

        return NextResponse.json({
            ...habit,
            createdAt: Number(habit.createdAt),
            updatedAt: Number(habit.updatedAt),
        });
    } catch (error) {
        console.error('Error creating habit:', error);
        return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
    }
}
