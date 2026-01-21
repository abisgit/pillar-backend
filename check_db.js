const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}
main();
