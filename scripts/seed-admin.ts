
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // Hash Password
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { mobile: '9999999999' },
        update: {
            password: hashedPassword, // Ensure password is set logic
            role: 'SUPER_ADMIN'
        },
        create: {
            mobile: '9999999999',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            password: hashedPassword,
            otp: null
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
