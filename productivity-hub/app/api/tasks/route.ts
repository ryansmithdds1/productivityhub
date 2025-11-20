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
        const { id, subtasks, ...data } = body;

        // Ensure timestamps are BigInt
        const payload = {
            ...data,
            dueDate: BigInt(data.dueDate),
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
            completedAt: data.completedAt ? BigInt(data.completedAt) : null,
            subtasks: {
                create: subtasks?.map((st: any) => ({
                    title: st.title,
                    completed: st.completed
                })) || []
            }
        };

        const task = await prisma.task.create({
            data: payload,
            include: { subtasks: true }
        });
        return NextResponse.json(serialize(task));
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, subtasks, ...data } = body;

        const payload = {
            ...data,
            dueDate: BigInt(data.dueDate),
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
            completedAt: data.completedAt ? BigInt(data.completedAt) : null,
        };

        // Update task
        const task = await prisma.task.update({
            where: { id },
            data: payload,
            include: { subtasks: true }
        });

        // Handle subtasks update (delete all and recreate is simplest for now, or intelligent update)
        // For simplicity in this phase, we'll delete existing and recreate if subtasks are provided
        if (subtasks) {
            await prisma.subtask.deleteMany({ where: { taskId: id } });
            if (subtasks.length > 0) {
                await prisma.subtask.createMany({
                    data: subtasks.map((st: any) => ({
                        taskId: id,
                        title: st.title,
                        completed: st.completed
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
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
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
