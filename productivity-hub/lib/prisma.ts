import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Configure Neon for serverless (use fetch instead of WebSocket)
neonConfig.fetchConnectionCache = true;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    const connectionString = process.env.POSTGRES_PRISMA_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
