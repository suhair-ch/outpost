
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Check the user credentials they might be using (e.g., Shop default)
    // Assuming they might be using the one I suggested or a common one
    const users = await prisma.user.findMany();
    console.log("--- ALL USERS & ROLES ---");
    users.forEach(u => console.log(`Mobile: ${u.mobile} | Role: ${u.role} | ID: ${u.id}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
