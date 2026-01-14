import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Smart Code Generator
function generateCode(name: string, district: string): string {
    // Custom overrides for major towns
    const overrides: Record<string, string> = {
        "Malappuram": "MLM", "Manjeri": "MNJ", "Perinthalmanna": "PMN", "Tirur": "TIR", "Nilambur": "NIL",
        "Kottakkal": "KTL", "Ponnani": "PNI", "Edappal": "EDP", "Valanchery": "VLY", "Kondotty": "KDT",
        "Tanur": "TNR", "Tirurangadi": "TRD", "Vengara": "VGR", "Areacode": "ARC", "Wandoor": "WND"
    };

    // Check override first (Case insensitive match)
    for (const key in overrides) {
        if (name.toLowerCase() === key.toLowerCase()) return overrides[key];
    }

    // Default: First 3 consonants or letters
    const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
    const consonants = clean.replace(/[AEIOU]/g, '');

    if (consonants.length >= 3) return consonants.substring(0, 3);
    return clean.substring(0, 3).padEnd(3, 'X');
}

const keralaData: Record<string, { name: string, pincode: string }[]> = {
    "Malappuram": [
        { name: "Malappuram HO", pincode: "676505" },
        { name: "Manjeri", pincode: "676121" },
        { name: "Perinthalmanna", pincode: "679322" },
        { name: "Tirur", pincode: "676101" },
        { name: "Nilambur", pincode: "679329" },
        { name: "Kottakkal", pincode: "676503" },
        { name: "Ponnani", pincode: "679577" },
        { name: "Edappal", pincode: "679576" },
        { name: "Valanchery", pincode: "676552" },
        { name: "Kondotty", pincode: "673638" },
        { name: "Tanur", pincode: "676302" },
        { name: "Tirurangadi", pincode: "676306" },
        { name: "Vengara", pincode: "676304" },
        { name: "Areacode", pincode: "673639" },
        { name: "Wandoor", pincode: "679328" },
        { name: "Melattur", pincode: "679326" },
        { name: "Edavanna", pincode: "676541" },
        { name: "Mampad", pincode: "676542" },

        { name: "Changaramkulam", pincode: "679575" },
        { name: "Kuttipuram", pincode: "679571" },
        { name: "Angadippuram", pincode: "679321" },
        { name: "Makkaraparamba", pincode: "676507" },
        { name: "Parappanangadi", pincode: "676303" },
        { name: "Thenhipalam", pincode: "673636" },
        { name: "Chelari", pincode: "673636" },
        { name: "Pandikkad", pincode: "676521" },
        { name: "Karulai", pincode: "679330" },
        { name: "Kalikavu", pincode: "676525" }
    ],
    "Thiruvananthapuram": [
        { name: "Thiruvananthapuram GPO", pincode: "695001" },
        { name: "Pettah", pincode: "695024" },
        { name: "Kazhakkoottam", pincode: "695582" },
        { name: "Kowdiar", pincode: "695003" },
        { name: "Nedumangad", pincode: "695541" },
        { name: "Neyyattinkara", pincode: "695121" },
        { name: "Varkala", pincode: "695141" },
        { name: "Attingal", pincode: "695101" },
        { name: "Parassala", pincode: "695502" },
        { name: "Kilimanoor", pincode: "695601" },
        { name: "Kakata", pincode: "695001" }, // Typo fix in source check
        { name: "Nylom", pincode: "695001" },
        { name: "Pothencode", pincode: "695584" },
        { name: "Sreekariyam", pincode: "695017" },
        { name: "Vattiyoorkavu", pincode: "695013" },
        { name: "Peroorkada", pincode: "695005" },
        { name: "Karamana", pincode: "695002" },
        { name: "Nemom", pincode: "695020" },
        { name: "Kattakada", pincode: "695572" },
        { name: "Balaramapuram", pincode: "695501" }
    ],
    "Kollam": [
        { name: "Kollam HO", pincode: "691001" },
        { name: "Chathannoor", pincode: "691572" },
        { name: "Karunagappally", pincode: "690518" },
        { name: "Kottarakkara", pincode: "691506" },
        { name: "Punalur", pincode: "691305" },
        { name: "Paravur", pincode: "691301" },
        { name: "Pathanapuram", pincode: "689695" },
        { name: "Sasthamcotta", pincode: "690521" },
        { name: "Kundara", pincode: "691501" },
        { name: "Anchal", pincode: "691306" },
        { name: "Chadayamangalam", pincode: "691534" },
        { name: "Oachira", pincode: "690526" },
        { name: "Chavara", pincode: "691583" },
        { name: "Kadakkal", pincode: "691536" },
        { name: "Kilikollur", pincode: "691004" }
    ],
    "Pathanamthitta": [
        { name: "Pathanamthitta HO", pincode: "689645" },
        { name: "Adoor", pincode: "691523" },
        { name: "Thiruvalla", pincode: "689101" },
        { name: "Ranni", pincode: "689672" },
        { name: "Pandalam", pincode: "689501" },
        { name: "Konni", pincode: "689691" },
        { name: "Kozhencherry", pincode: "689641" },
        { name: "Mallappally", pincode: "689585" },
        { name: "Aranmula", pincode: "689533" },
        { name: "Kumbanad", pincode: "689547" },
        { name: "Pullad", pincode: "689548" },
        { name: "Parumala", pincode: "689626" }
    ],
    "Alappuzha": [
        { name: "Alappuzha HO", pincode: "688001" },
        { name: "Cherthala", pincode: "688524" },
        { name: "Kayamkulam", pincode: "690502" },
        { name: "Mavelikkara", pincode: "690101" },
        { name: "Chengannur", pincode: "689121" },
        { name: "Haripad", pincode: "690514" },
        { name: "Ambalapuzha", pincode: "688561" },
        { name: "Aroor", pincode: "688534" },
        { name: "Edathua", pincode: "689573" },
        { name: "Mannar", pincode: "689622" },
        { name: "Thuravoor", pincode: "688532" }
    ],
    "Kottayam": [
        { name: "Kottayam HO", pincode: "686001" },
        { name: "Changanassery", pincode: "686101" },
        { name: "Pala", pincode: "686575" },
        { name: "Vaikom", pincode: "686141" },
        { name: "Ettumanoor", pincode: "686631" },
        { name: "Kanjirappally", pincode: "686507" },
        { name: "Erattupetta", pincode: "686121" },
        { name: "Pampady", pincode: "686502" },
        { name: "Mundakayam", pincode: "686513" },
        { name: "Kuravilangad", pincode: "686633" },
        { name: "Ramapuram", pincode: "686576" },
        { name: "Chingavanam", pincode: "686531" }
    ],
    "Idukki": [
        { name: "Thodupuzha", pincode: "685584" },
        { name: "Munnar", pincode: "685612" },
        { name: "Adimali", pincode: "685561" },
        { name: "Painavu", pincode: "685603" },
        { name: "Kattappana", pincode: "685508" },
        { name: "Nedumkandam", pincode: "685553" },
        { name: "Kumily", pincode: "685509" },
        { name: "Peermade", pincode: "685531" },
        { name: "Vandiperiyar", pincode: "685533" },
        { name: "Rajakkad", pincode: "685566" },
        { name: "Murickassery", pincode: "685604" }
    ],
    "Ernakulam": [
        { name: "Ernakulam HO", pincode: "682011" },
        { name: "Kochi", pincode: "682001" },
        { name: "Aluva", pincode: "683101" },
        { name: "Edappally", pincode: "682024" },
        { name: "Kaloor", pincode: "682017" },
        { name: "Vyttila", pincode: "682019" },
        { name: "Angamaly", pincode: "683572" },
        { name: "Perumbavoor", pincode: "683542" },
        { name: "Tripunithura", pincode: "682301" },
        { name: "Kalamassery", pincode: "683104" },
        { name: "Muvattupuzha", pincode: "686661" },
        { name: "Kothamangalam", pincode: "686691" },
        { name: "North Paravur", pincode: "683513" },
        { name: "Kakkinada", pincode: "682030" },
        { name: "Piravom", pincode: "686664" },
        { name: "Kolenchery", pincode: "682311" },
        { name: "Koothattukulam", pincode: "686662" }
    ],
    "Thrissur": [
        { name: "Thrissur HO", pincode: "680001" },
        { name: "Chalakudy", pincode: "680307" },
        { name: "Kodungallur", pincode: "680664" },
        { name: "Guruvayur", pincode: "680101" },
        { name: "Kunnamkulam", pincode: "680503" },
        { name: "Irinjalakuda", pincode: "680121" },
        { name: "Wadakkanchery", pincode: "680582" },
        { name: "Chavakkad", pincode: "680506" },
        { name: "Pudukad", pincode: "680301" },
        { name: "Triprayar", pincode: "680567" },
        { name: "Ollur", pincode: "680306" },
        { name: "Mannuthy", pincode: "680651" },
        { name: "Koratty", pincode: "680308" },
        { name: "Mala", pincode: "680732" }
    ],
    "Palakkad": [
        { name: "Palakkad HO", pincode: "678001" },
        { name: "Ottapalam", pincode: "679101" },
        { name: "Chittur", pincode: "678101" },
        { name: "Mannarkkad", pincode: "678582" },
        { name: "Pattambi", pincode: "679303" },
        { name: "Shoranur", pincode: "679121" },
        { name: "Alathur", pincode: "678541" },
        { name: "Vadakkencherry", pincode: "678683" },
        { name: "Cherpulassery", pincode: "679503" },
        { name: "Nemmara", pincode: "678508" },
        { name: "Kollengode", pincode: "678506" },
        { name: "Walayar", pincode: "678624" },
        { name: "Kanjikode", pincode: "678621" }
    ],

    "Kozhikode": [
        { name: "Kozhikode HO", pincode: "673001" },
        { name: "Vadakara", pincode: "673101" },
        { name: "Koyilandy", pincode: "673305" },
        { name: "Thamarassery", pincode: "673573" },
        { name: "Ramanattukara", pincode: "673633" },
        { name: "Feroke", pincode: "673631" },
        { name: "Mukkam", pincode: "673602" },
        { name: "Perambra", pincode: "673525" },
        { name: "Balussery", pincode: "673612" },
        { name: "Koduvally", pincode: "673572" },
        { name: "Kunnamangalam", pincode: "673571" },
        { name: "Mavoor", pincode: "673661" },
        { name: "Nadapuram", pincode: "673504" },
        { name: "Kuttiady", pincode: "673508" },
        { name: "Beypore", pincode: "673015" }
    ],
    "Wayanad": [
        { name: "Kalpetta", pincode: "673121" },
        { name: "Mananthavady", pincode: "670645" },
        { name: "Sulthan Bathery", pincode: "673592" },
        { name: "Meppadi", pincode: "673577" },
        { name: "Vythiri", pincode: "673576" },
        { name: "Pulpally", pincode: "673579" },
        { name: "Panamaram", pincode: "670721" }
    ],
    "Kannur": [
        { name: "Kannur HO", pincode: "670001" },
        { name: "Thalassery", pincode: "670101" },
        { name: "Payyannur", pincode: "670307" },
        { name: "Taliparamba", pincode: "670141" },
        { name: "Iritty", pincode: "670703" },
        { name: "Mattannur", pincode: "670702" },
        { name: "Kuthuparamba", pincode: "670643" },
        { name: "Payyavoor", pincode: "670633" },
        { name: "Sreekandapuram", pincode: "670631" },
        { name: "Panoor", pincode: "670692" },
        { name: "Chakkarakkal", pincode: "670613" },
        { name: "Dharmadam", pincode: "670106" }
    ],
    "Kasargod": [
        { name: "Kasargod HO", pincode: "671121" },
        { name: "Kanhangad", pincode: "671315" },
        { name: "Uppala", pincode: "671322" },
        { name: "Nileshwar", pincode: "671314" },
        { name: "Cheruvathur", pincode: "671313" },
        { name: "Manjeshwar", pincode: "671323" },
        { name: "Trikarpur", pincode: "671310" },
        { name: "Badiadka", pincode: "671551" },
        { name: "Mulleria", pincode: "671543" }
    ]
};

async function main() {
    console.log('🌱 Seeding Kerala Areas...');

    // Upsert Logic (To update Codes)
    for (const [district, areas] of Object.entries(keralaData)) {
        for (const area of areas) {
            const normalized = area.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            const code = generateCode(area.name, district);

            // Upsert: Create if new, Update Code if exists
            await prisma.area.upsert({
                where: {
                    normalizedName_district: { // Compound constraint
                        normalizedName: normalized,
                        district: district
                    }
                },
                update: {
                    code: code, // START BACKFILLING CODES
                    pincode: area.pincode
                },
                create: {
                    name: area.name,
                    normalizedName: normalized,
                    code: code,
                    pincode: area.pincode,
                    district: district,
                    state: "Kerala",
                    source: 'INDIA_POST',
                    isActive: true
                }
            });
            process.stdout.write('.'); // Progress dot
        }
    }
    console.log('\n✅ Areas Seeded/Updated with Codes.');

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
