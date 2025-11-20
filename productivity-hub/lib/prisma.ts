import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Use native WebSocket in serverless environments
if (typeof WebSocket !== 'undefined') {
    neonConfig.webSocketConstructor = WebSocket;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
