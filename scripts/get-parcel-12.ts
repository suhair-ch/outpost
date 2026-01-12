
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = 12;
    const parcel = await prisma.parcel.findUnique({
        where: { id: id }
    });
    console.log(JSON.stringify(parcel, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
