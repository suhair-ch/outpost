
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for Admin user...');
    try {
        const user = await prisma.user.findUnique({
            where: { mobile: '9999999999' }
        });
        console.log('User found:', user);
    } catch (e) {
        console.error('Error querying user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
