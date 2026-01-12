
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- List of Drivers ---');
    const drivers = await prisma.user.findMany({
        where: { role: 'DRIVER' } // Users with ROLE='DRIVER'
    });

    const driverProfiles = await prisma.driver.findMany();

    if (drivers.length === 0) {
        console.log('No Driver Users found.');
    } else {
        drivers.forEach(d => {
            console.log(`User ID: ${d.id}, Mobile: ${d.mobile}, Role: ${d.role}`);
        });
    }

    console.log('\n--- Driver Profiles ---');
    if (driverProfiles.length === 0) {
        console.log('No Driver Profiles found.');
    } else {
        driverProfiles.forEach(d => {
            console.log(`Driver ID: ${d.id}, Name: ${d.name}, Mobile: ${d.mobile}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
