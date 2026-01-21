import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Goal Templates
    const templates = [
        // Health & Fitness
        { title: 'Drink 2–3L of water', category: 'Health & Fitness', horizon: 'Daily' },
        { title: '7–10k steps', category: 'Health & Fitness', horizon: 'Daily' },
        { title: '3–5 strength workouts', category: 'Health & Fitness', horizon: 'Weekly' },
        // Mental Health
        { title: 'Morning gratitude', category: 'Mental Health & Mindset', horizon: 'Daily' },
        { title: 'Mindfulness (5-10 min)', category: 'Mental Health & Mindset', horizon: 'Daily' },
        { title: 'Journaling reflection', category: 'Mental Health & Mindset', horizon: 'Weekly' },
        // Career
        { title: 'Deep work (60-120 min)', category: 'Career / Professional Growth', horizon: 'Daily' },
        { title: 'Skill practice', category: 'Career / Professional Growth', horizon: 'Daily' },
        { title: 'Update resume', category: 'Career / Professional Growth', horizon: 'Weekly' },
        // Finances
        { title: 'Track expenses', category: 'Finances', horizon: 'Daily' },
        { title: 'Review budget', category: 'Finances', horizon: 'Weekly' },
        // Relationships
        { title: 'Quality conversation', category: 'Relationships', horizon: 'Daily' },
        { title: 'Date night / Family time', category: 'Relationships', horizon: 'Weekly' },
        // Personal Growth
        { title: 'Read 10-30 min', category: 'Personal Growth', horizon: 'Daily' },
        // Productivity
        { title: 'Top 3 priorities', category: 'Productivity & Discipline', horizon: 'Daily' },
    ];

    for (const t of templates) {
        await prisma.goalTemplate.create({ data: t });
    }

    // 2. Communities
    const communities = [
        { name: 'Hardcore Coders', description: 'Building the future one line at a time.', city: 'San Francisco' },
        { name: 'Zen Seekers', description: 'Meditation, mindfulness, and inner peace.', city: 'Kyoto' },
        { name: 'Finance Fighters', description: 'Beating inflation and building wealth.', city: 'New York' },
        { name: 'Fitness Fanatics', description: 'No pain, no gain.', city: 'London' },
    ];

    for (const c of communities) {
        await prisma.community.create({ data: c });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
