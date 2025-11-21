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
        const workouts = await prisma.workout.findMany({
            include: {
                exercises: {
                    include: {
                        exercise: true,
                        sets: true
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { date: 'desc' },
            take: 10
        });
        return NextResponse.json(serialize(workouts));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, date, exercises } = body;

        // Create workout with nested exercises and sets
        const workout = await prisma.workout.create({
            data: {
                name,
                date: date || Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                exercises: {
                    create: exercises.map((ex: any, index: number) => ({
                        exerciseId: ex.exerciseId,
                        order: index,
                        sets: {
                            create: ex.sets.map((set: any) => ({
                                reps: set.reps,
                                weight: set.weight,
                                type: set.type || 'working',
                                completed: set.completed || false
                            }))
                        }
                    }))
                }
            },
            include: {
                exercises: {
                    include: {
                        sets: true
                    }
                }
            }
        });

        return NextResponse.json(serialize(workout));
    } catch (error) {
        console.error('Error creating workout:', error);
        return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
    }
}
