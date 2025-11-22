import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { habitId, date, completed } = body;

        if (!habitId || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If completed is false, delete the log entry
        if (completed === false) {
            await prisma.habitLog.deleteMany({
                where: {
                    habitId,
                    date
                }
            });
            return NextResponse.json({ success: true, deleted: true });
        }

        // Otherwise upsert (create or update)
        const log = await prisma.habitLog.upsert({
            where: {
                habitId_date: {
                    habitId,
                    date
                }
            },
            update: {
                completed: true
            },
            create: {
                habitId,
                date,
                completed: true
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error('Error logging habit:', error);
        return NextResponse.json({ error: 'Failed to log habit' }, { status: 500 });
    }
}
