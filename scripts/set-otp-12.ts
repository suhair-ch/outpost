
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = 12; // The ID user is asking about
    const otp = '1234';

    await prisma.parcel.update({
        where: { id: id },
        data: { deliveryOtp: otp, status: 'DISPATCHED' } // Ensure status allows delivery (DISPATCHED or COLLECTED_FROM_SHOP)
    });

    console.log(`UPDATED Parcel 12: OTP = ${otp}, Status = DISPATCHED`);
    console.log("You can now test OTP '1234' in the Shop Dashboard.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
