
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Migrating Roles ---');

    // Update all users with role 'ADMIN' to 'SUPER_ADMIN'
    const result = await prisma.user.updateMany({
        where: { role: 'ADMIN' },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`Updated ${result.count} users from 'ADMIN' to 'SUPER_ADMIN'.`);

    // Verify
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    console.log('Current Super Admins:');
    admins.forEach(u => console.log(` - ${u.mobile} (${u.role})`));
}

main();
