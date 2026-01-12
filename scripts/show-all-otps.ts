
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- BUSY PARCEL OTPs (Latest 20) ---");
    const parcels = await prisma.parcel.findMany({
        where: {
            deliveryOtp: { not: null }
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
    });

    if (parcels.length === 0) {
        console.log("No active OTPs found. (OTPs are cleared after successful delivery)");
    } else {
        console.table(parcels.map(p => ({
            ID: p.id,
            Status: p.status,
            OTP: p.deliveryOtp,
            Receiver: p.receiverName
        })));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
