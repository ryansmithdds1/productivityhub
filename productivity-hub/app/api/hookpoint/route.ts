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
        const scripts = await prisma.hookpointScript.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(serialize(scripts));
    } catch (error) {
        console.error('Error fetching scripts:', error);
        return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const payload = {
            ...data,
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
        };

        const script = await prisma.hookpointScript.create({
            data: payload
        });
        return NextResponse.json(serialize(script));
    } catch (error) {
        console.error('Error creating script:', error);
        return NextResponse.json({
            error: 'Failed to create script',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const payload = {
            ...data,
            createdAt: BigInt(data.createdAt),
            updatedAt: BigInt(data.updatedAt),
        };

        const script = await prisma.hookpointScript.update({
            where: { id },
            data: payload
        });
        return NextResponse.json(serialize(script));
    } catch (error) {
        console.error('Error updating script:', error);
        return NextResponse.json({
            error: 'Failed to update script',
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

        await prisma.hookpointScript.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting script:', error);
        return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 });
    }
}
