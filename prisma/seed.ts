import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const keralaData = {
    "Thiruvananthapuram": [
        { name: "GPO", pincode: "695001" },
        { name: "Pettah", pincode: "695024" },
        { name: "Kazhakkoottam", pincode: "695582" },
        { name: "Kowdiar", pincode: "695003" },
        { name: "Nedumangad", pincode: "695541" },
        { name: "Neyyattinkara", pincode: "695121" },
        { name: "Varkala", pincode: "695141" },
        { name: "Attingal", pincode: "695101" }
    ],
    "Kollam": [
        { name: "Kollam HO", pincode: "691001" },
        { name: "Chathannoor", pincode: "691572" },
        { name: "Karunagappally", pincode: "690518" },
        { name: "Kottarakkara", pincode: "691506" },
        { name: "Punalur", pincode: "691305" }
    ],
    "Pathanamthitta": [
        { name: "Pathanamthitta HO", pincode: "689645" },
        { name: "Adoor", pincode: "691523" },
        { name: "Thiruvalla", pincode: "689101" },
        { name: "Ranni", pincode: "689672" }
    ],
    "Alappuzha": [
        { name: "Alappuzha HO", pincode: "688001" },
        { name: "Cherthala", pincode: "688524" },
        { name: "Kayamkulam", pincode: "690502" },
        { name: "Mavelikkara", pincode: "690101" }
    ],
    "Kottayam": [
        { name: "Kottayam HO", pincode: "686001" },
        { name: "Changanassery", pincode: "686101" },
        { name: "Pala", pincode: "686575" },
        { name: "Vaikom", pincode: "686141" }
    ],
    "Idukki": [
        { name: "Thodupuzha", pincode: "685584" },
        { name: "Munnar", pincode: "685612" },
        { name: "Adimali", pincode: "685561" },
        { name: "Painavu", pincode: "685603" }
    ],
    "Ernakulam": [
        { name: "Ernakulam HO", pincode: "682011" },
        { name: "Kochi", pincode: "682001" },
        { name: "Aluva", pincode: "683101" },
        { name: "Edappally", pincode: "682024" },
        { name: "Kaloor", pincode: "682017" },
        { name: "Vyttila", pincode: "682019" },
        { name: "Angamaly", pincode: "683572" },
        { name: "Perumbavoor", pincode: "683542" }
    ],
    "Thrissur": [
        { name: "Thrissur HO", pincode: "680001" },
        { name: "Chalakudy", pincode: "680307" },
        { name: "Kodungallur", pincode: "680664" },
        { name: "Guruvayur", pincode: "680101" },
        { name: "Kunnamkulam", pincode: "680503" }
    ],
    "Palakkad": [
        { name: "Palakkad HO", pincode: "678001" },
        { name: "Ottapalam", pincode: "679101" },
        { name: "Chittur", pincode: "678101" },
        { name: "Mannarkkad", pincode: "678582" }
    ],
    "Malappuram": [
        { name: "Malappuram HO", pincode: "676505" },
        { name: "Manjeri", pincode: "676121" },
        { name: "Perinthalmanna", pincode: "679322" },
        { name: "Tirur", pincode: "676101" },
        { name: "Nilambur", pincode: "679329" }
    ],
    "Kozhikode": [
        { name: "Kozhikode HO", pincode: "673001" },
        { name: "Vadakara", pincode: "673101" },
        { name: "Koyilandy", pincode: "673305" },
        { name: "Thamarassery", pincode: "673573" }
    ],
    "Wayanad": [
        { name: "Kalpetta", pincode: "673121" },
        { name: "Mananthavady", pincode: "670645" },
        { name: "Sulthan Bathery", pincode: "673592" }
    ],
    "Kannur": [
        { name: "Kannur HO", pincode: "670001" },
        { name: "Thalassery", pincode: "670101" },
        { name: "Payyannur", pincode: "670307" },
        { name: "Taliparamba", pincode: "670141" }
    ],
    "Kasargod": [
        { name: "Kasargod HO", pincode: "671121" },
        { name: "Kanhangad", pincode: "671315" },
        { name: "Uppala", pincode: "671322" }
    ]
};

async function main() {
    console.log('🌱 Seeding Kerala Areas...');

    // Flatten and Normalize data
    const flatData: any[] = [];
    for (const [district, areas] of Object.entries(keralaData)) {
        for (const area of areas) {
            const normalized = area.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            flatData.push({
                name: area.name,
                normalizedName: normalized,
                pincode: area.pincode,
                district: district,
                state: "Kerala",
                source: 'INDIA_POST',
                isActive: true
            });
        }
    }

    // Check if data exists
    const count = await prisma.area.count();
    if (count === 0) {
        console.log(`Populating ${flatData.length} areas...`);
        await prisma.area.createMany({
            data: flatData,
            skipDuplicates: true // Safety against unique constraints
        });
        console.log(`✅ Seeded ${flatData.length} areas.`);
    } else {
        console.log('ℹ️ Areas already seeded. Skipping.');
    }

    // Seed Super Admin
    const superAdminMobile = '9999999999';
    const adminExists = await prisma.user.findUnique({ where: { mobile: superAdminMobile } });

    if (!adminExists) {
        console.log('👑 Seeding Super Admin...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                mobile: superAdminMobile,
                role: 'SUPER_ADMIN',
                password: hashedPassword,
                status: 'ACTIVE',
                district: 'Thiruvananthapuram' // Default
            }
        });
        console.log('✅ Super Admin Created (Mobile: 9999999999, Pass: admin123)');
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
