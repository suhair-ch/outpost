
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const parcels = await prisma.parcel.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log("--- LATEST 5 PARCELS ---");
    parcels.forEach(p => {
        console.log(`ID: ${p.id} | Status: ${p.status} | OTP: ${p.deliveryOtp || 'NULL'} | Created: ${p.createdAt}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
