import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('👑 Creating Super Admin...');

    const superAdminMobile = '9999999999';
    const existing = await prisma.user.findUnique({ where: { mobile: superAdminMobile } });

    if (!existing) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const user = await prisma.user.create({
            data: {
                mobile: superAdminMobile,
                role: 'SUPER_ADMIN',
                password: hashedPassword,
                status: 'ACTIVE',
                district: 'Thiruvananthapuram'
            }
        });
        console.log(`✅ Super Admin Created! ID: ${user.id}`);
    } else {
        console.log('ℹ️ Super Admin already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
