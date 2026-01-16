import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting System Cleanup...');

    // 1. Delete Foreign Key Dependents First
    const deletedParcels = await prisma.parcel.deleteMany({});
    console.log(`- Deleted ${deletedParcels.count} Parcels`);

    const deletedSettlements = await prisma.settlement.deleteMany({});
    console.log(`- Deleted ${deletedSettlements.count} Settlements`);

    const deletedRoutes = await prisma.route.deleteMany({});
    console.log(`- Deleted ${deletedRoutes.count} Routes`);

    // 2. Delete Core Entities
    const deletedDrivers = await prisma.driver.deleteMany({});
    console.log(`- Deleted ${deletedDrivers.count} Drivers`);

    const deletedShops = await prisma.shop.deleteMany({});
    console.log(`- Deleted ${deletedShops.count} Shops`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`- Deleted ${deletedUsers.count} Users`);

    console.log('✅ System Wiped Clean (Areas Preserved).');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
