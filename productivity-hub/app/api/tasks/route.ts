import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to serialize BigInt
const serialize = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? Number(value)
            : value
    ));
};

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            include: { subtasks: true },
            orderBy: { dueDate: 'asc' }
        });
        return NextResponse.json(serialize(tasks));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, subtasks, timeBlock, recurring, ...data } = body;

        // Build payload with proper type conversions and validation
        const payload: any = {
            title: data.title,
            description: data.description || null,
            dueDate: data.dueDate && !isNaN(data.dueDate) && data.dueDate > 0
                ? BigInt(data.dueDate)
                : BigInt(Date.now()),
            priority: data.priority,
            category: data.category,
            completed: data.completed || false,
            completedAt: data.completedAt ? BigInt(data.completedAt) : null,
            createdAt: data.createdAt && !isNaN(data.createdAt)
                ? BigInt(data.createdAt)
                : BigInt(Date.now()),
            updatedAt: data.updatedAt && !isNaN(data.updatedAt)
                ? BigInt(data.updatedAt)
                : BigInt(Date.now()),
        };

        // Add JSON fields only if they exist
        if (timeBlock) {
            payload.timeBlock = timeBlock;
        }
        if (recurring) {
            payload.recurring = recurring;
        }

        // Add subtasks if they exist
        if (subtasks && subtasks.length > 0) {
            payload.subtasks = {
                create: subtasks.map((st: any) => ({
                    title: st.title,
                    completed: st.completed || false
                }))
            };
        }

        const task = await prisma.task.create({
            data: payload,
            include: { subtasks: true }
        });
        return NextResponse.json(serialize(task));
    } catch (error) {
        console.error('Error creating task:', error);
        // Log the full error details
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        return NextResponse.json({
            error: 'Failed to create task',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, subtasks, timeBlock, recurring, ...data } = body;

        // Build payload with proper type conversions
        const payload: any = {
            title: data.title,
            description: data.description || null,
            dueDate: BigInt(data.dueDate),
            priority: data.priority,
            category: data.category,
            completed: data.completed || false,
            completedAt: data.completedAt ? BigInt(data.completedAt) : null,
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
        };

        // Add JSON fields only if they exist
        if (timeBlock) {
            payload.timeBlock = timeBlock;
        }
        if (recurring) {
            payload.recurring = recurring;
        }

        // Update task
        const task = await prisma.task.update({
            where: { id },
            data: payload,
            include: { subtasks: true }
        });

        // Handle subtasks update
        if (subtasks !== undefined) {
            await prisma.subtask.deleteMany({ where: { taskId: id } });
            if (subtasks.length > 0) {
                await prisma.subtask.createMany({
                    data: subtasks.map((st: any) => ({
                        taskId: id,
                        title: st.title,
                        completed: st.completed || false
                    }))
                });
            }
        }

        const updatedTask = await prisma.task.findUnique({
            where: { id },
            include: { subtasks: true }
        });

        return NextResponse.json(serialize(updatedTask));
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({
            error: 'Failed to update task',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
