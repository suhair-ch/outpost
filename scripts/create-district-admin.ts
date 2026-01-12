
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const mobile = '9000090000';
    const district = 'Ernakulam';
    const password = 'password123';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { mobile },
            update: {
                role: 'DISTRICT_ADMIN',
                district
            },
            create: {
                mobile,
                role: 'DISTRICT_ADMIN',
                district,
                password: hashedPassword
            }
        });

        console.log(`✅ Created/Updated District Admin:`);
        console.log(`   Mobile: ${mobile}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   District: ${user.district}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
