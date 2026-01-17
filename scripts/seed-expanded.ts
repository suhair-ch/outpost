
// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const usedCodes = new Set<string>();

// Reuse the Code Generation Logic (Simplified for this script)
function generateUniqueCode(name: string, district: string): string {
    const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
    let code = clean.substring(0, 3);
    if (code.length < 3) code = code.padEnd(3, 'X');

    // Simple suffix strategy for collisions in this batch run
    let counter = 1;
    let finalCode = code;
    while (usedCodes.has(finalCode)) {
        finalCode = code.substring(0, 3) + counter;
        counter++;
    }
    usedCodes.add(finalCode);
    return finalCode;
}

const malappuramCommon = [
    // Tirur Taluk / Areas
    { name: "Alathiyur", pincode: "676102", zone: "Tirur Zone" },
    { name: "Vettom", pincode: "676102", zone: "Tirur Zone" },
    { name: "Chamravattom", pincode: "676102", zone: "Tirur Zone" },
    { name: "Purathur", pincode: "676102", zone: "Tirur Zone" },
    { name: "Thalakkad", pincode: "676102", zone: "Tirur Zone" },
    { name: "Mangalam", pincode: "676561", zone: "Tirur Zone" },
    { name: "BP Angadi", pincode: "676102", zone: "Tirur Zone" },
    { name: "Trikkandiyur", pincode: "676104", zone: "Tirur Zone" },
    { name: "Pachattiri", pincode: "676105", zone: "Tirur Zone" },
    { name: "Niramaruthur", pincode: "676109", zone: "Tirur Zone" },
    { name: "Tanur", pincode: "676302", zone: "Tanur Zone" },
    { name: "Ozhur", pincode: "676307", zone: "Tanur Zone" },
    { name: "Nannambra", pincode: "676320", zone: "Tanur Zone" },
    { name: "Ponmundam", pincode: "676106", zone: "Tanur Zone" },
    { name: "Cheriyamundam", pincode: "676106", zone: "Tanur Zone" },

    // Perinthalmanna
    { name: "Angadippuram", pincode: "679321", zone: "Perinthalmanna Zone" },
    { name: "Aliparamba", pincode: "679357", zone: "Perinthalmanna Zone" },
    { name: "Anamangad", pincode: "679357", zone: "Perinthalmanna Zone" },
    { name: "Arakkaparamba", pincode: "679322", zone: "Perinthalmanna Zone" },
    { name: "Thazhekod", pincode: "679341", zone: "Perinthalmanna Zone" },
    { name: "Vettathur", pincode: "679326", zone: "Perinthalmanna Zone" },
    { name: "Pulamanthole", pincode: "679323", zone: "Perinthalmanna Zone" },

    // Manjeri / Ernad
    { name: "Anakkayam", pincode: "676509", zone: "Manjeri Zone" },
    { name: "Pandikkad", pincode: "676521", zone: "Manjeri Zone" },
    { name: "Trikkalangode", pincode: "676123", zone: "Manjeri Zone" },
    { name: "Edavanna", pincode: "676541", zone: "Manjeri Zone" },
    { name: "Kavanoor", pincode: "673639", zone: "Manjeri Zone" },
    { name: "Pulpatta", pincode: "676123", zone: "Manjeri Zone" },

    // Ponnani / Edappal
    { name: "Nannamukku", pincode: "679575", zone: "Edappal Zone" },
    { name: "Alamcode", pincode: "679585", zone: "Edappal Zone" },
    { name: "Veliyankode", pincode: "679579", zone: "Edappal Zone" },
    { name: "Maranchery", pincode: "679581", zone: "Edappal Zone" },
    { name: "Vattamkulam", pincode: "679578", zone: "Edappal Zone" },
    { name: "Kalady", pincode: "679582", zone: "Edappal Zone" },

    // Kottakkal / Vengara
    { name: "Othukkungal", pincode: "676528", zone: "Kottakkal Zone" },
    { name: "Ponmala", pincode: "676528", zone: "Kottakkal Zone" },
    { name: "Marakkara", pincode: "676551", zone: "Kottakkal Zone" },
    { name: "Edayur", pincode: "676552", zone: "Kottakkal Zone" },
    { name: "Irimbiliyam", pincode: "679572", zone: "Kottakkal Zone" },
    { name: "Kannamangalam", pincode: "676304", zone: "Vengara Zone" },
    { name: "Oorakam", pincode: "676519", zone: "Vengara Zone" },
    { name: "Parappur", pincode: "676503", zone: "Vengara Zone" },
    { name: "Abdu Rahiman Nagar", pincode: "676305", zone: "Vengara Zone" },
    { name: "Thennala", pincode: "676511", zone: "Vengara Zone" },

    // Kondotty
    { name: "Cheekkode", pincode: "673645", zone: "Kondotty Zone" },
    { name: "Muthuvallur", pincode: "673638", zone: "Kondotty Zone" },
    { name: "Pallikkal", pincode: "673634", zone: "Kondotty Zone" },
    { name: "Cherukavu", pincode: "673637", zone: "Kondotty Zone" },
    { name: "Vazhayur", pincode: "673633", zone: "Kondotty Zone" }
];

async function seed() {
    console.log('🌱 Seeding Expanded Malappuram Areas...');
    const district = "Malappuram";

    for (const place of malappuramCommon) {
        const normalized = place.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const code = generateUniqueCode(place.name, district);

        await prisma.area.upsert({
            where: {
                normalizedName_district: {
                    normalizedName: normalized,
                    district: district
                }
            },
            update: {
                pincode: place.pincode,
                zone: place.zone // Updating Zone!
            },
            create: {
                name: place.name,
                normalizedName: normalized,
                code: code,
                pincode: place.pincode,
                district: district,
                zone: place.zone,
                state: "Kerala",
                source: 'SEED_SCRIPT',
                isActive: true
            }
        });
        process.stdout.write('+');
    }
    console.log('\n✅ Malappuram Expanded Seed Complete.');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
