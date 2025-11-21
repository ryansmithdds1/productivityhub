const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exercises = [
    // Push
    { name: 'Bench Press', category: 'Push', defaultSets: 3, defaultReps: 8 },
    { name: 'Overhead Press', category: 'Push', defaultSets: 3, defaultReps: 10 },
    { name: 'Incline Dumbbell Press', category: 'Push', defaultSets: 3, defaultReps: 10 },
    { name: 'Lateral Raises', category: 'Push', defaultSets: 3, defaultReps: 15 },
    { name: 'Tricep Pushdowns', category: 'Push', defaultSets: 3, defaultReps: 12 },

    // Pull
    { name: 'Deadlift', category: 'Pull', defaultSets: 3, defaultReps: 5 },
    { name: 'Pull Ups', category: 'Pull', defaultSets: 3, defaultReps: 8 },
    { name: 'Barbell Rows', category: 'Pull', defaultSets: 3, defaultReps: 10 },
    { name: 'Face Pulls', category: 'Pull', defaultSets: 3, defaultReps: 15 },
    { name: 'Bicep Curls', category: 'Pull', defaultSets: 3, defaultReps: 12 },

    // Legs
    { name: 'Squat', category: 'Legs', defaultSets: 3, defaultReps: 8 },
    { name: 'Romanian Deadlift', category: 'Legs', defaultSets: 3, defaultReps: 10 },
    { name: 'Leg Press', category: 'Legs', defaultSets: 3, defaultReps: 12 },
    { name: 'Leg Extensions', category: 'Legs', defaultSets: 3, defaultReps: 15 },
    { name: 'Calf Raises', category: 'Legs', defaultSets: 4, defaultReps: 15 },
];

async function main() {
    console.log('Seeding exercises...');
    for (const ex of exercises) {
        await prisma.exercise.create({
            data: {
                ...ex,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        });
    }
    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
