import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        const content = await prisma.content.findMany({
            orderBy: { dueDate: 'asc' }
        });
        return NextResponse.json(serialize(content));
    } catch (error) {
        console.error('Error fetching content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        // Ensure timestamps are BigInt
        const payload = {
            ...data,
            dueDate: BigInt(data.dueDate),
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
            weekOf: data.weekOf ? BigInt(data.weekOf) : null,
            sendDate: data.sendDate ? BigInt(data.sendDate) : null,
        };

        const content = await prisma.content.create({
            data: payload
        });
        return NextResponse.json(serialize(content));
    } catch (error) {
        console.error('Error creating content:', error);
        return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const payload = {
            ...data,
            dueDate: BigInt(data.dueDate),
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
            weekOf: data.weekOf ? BigInt(data.weekOf) : null,
            sendDate: data.sendDate ? BigInt(data.sendDate) : null,
        };

        const content = await prisma.content.update({
            where: { id },
            data: payload
        });
        return NextResponse.json(serialize(content));
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.content.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting content:', error);
        return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
    }
}
