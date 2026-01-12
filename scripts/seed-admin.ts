
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { mobile: '9999999999' },
        update: {},
        create: {
            mobile: '9999999999',
            role: 'SUPER_ADMIN', // Ensuring this matches Role.ADMIN (SUPER_ADMIN)
            status: 'ACTIVE',
            otp: '1234' // Mock OTP
        }
    });

    console.log('Admin user created:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
