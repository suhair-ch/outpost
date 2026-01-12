
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Assigning Districts ---');

    // Get all shops
    const shops = await prisma.shop.findMany();

    if (shops.length > 0) {
        // Assign first shop to Ernakulam
        await prisma.shop.update({
            where: { id: shops[0].id },
            data: { district: 'Ernakulam' }
        });
        console.log(`updated Shop ${shops[0].id} (${shops[0].shopName}) -> Ernakulam`);

        // Assign second shop (if exists) to Trivandrum
        if (shops.length > 1) {
            await prisma.shop.update({
                where: { id: shops[1].id },
                data: { district: 'Trivandrum' }
            });
            console.log(`updated Shop ${shops[1].id} (${shops[1].shopName}) -> Trivandrum`);
        }
    } else {
        console.log('No shops found to update.');
    }
}

main();
