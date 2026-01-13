
import { inviteUser, signup } from '../src/controllers/authController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock Response
const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.data = data;
        return res;
    };
    return res;
};

async function runTests() {
    console.log("🚀 Starting Invite Logic Verification...");

    const randomSuffix = Math.floor(Math.random() * 10000);
    const superAdminMobile = `999${randomSuffix}`;
    const daMobile = `888${randomSuffix}`;
    const shopMobile = `777${randomSuffix}`;

    // 1. Create Super Admin (Seed)
    console.log("Creating Mock Super Admin...");
    await prisma.user.upsert({
        where: { mobile: superAdminMobile },
        update: {},
        create: { mobile: superAdminMobile, role: 'SUPER_ADMIN', status: 'ACTIVE', password: 'hash' }
    });

    // 2. Test: Super Admin Invites District Admin
    console.log("Testing: Super Admin invites District Admin...");
    const req1: any = {
        body: {
            mobile: daMobile,
            role: 'DISTRICT_ADMIN',
            district: 'Trivandrum'
        },
        user: { role: 'SUPER_ADMIN' }
    };
    const res1 = mockRes();
    await inviteUser(req1, res1);

    if (res1.statusCode && res1.statusCode !== 200) {
        console.error("❌ Failed to invite DA:", res1.data);
    } else {
        console.log("✅ DA Invite Success:", res1.data?.message);
    }

    // Verify DB Status
    const daUser = await prisma.user.findUnique({ where: { mobile: daMobile } });
    if (daUser?.status !== 'INVITED') {
        console.error("❌ DA Status is NOT INVITED:", daUser?.status);
    } else {
        console.log("✅ DA Status verified as INVITED");
    }

    // 3. Test: District Admin Invites Shop
    console.log("Testing: District Admin invites Shop...");
    // Need to login as DA first? No, we mock req.user
    const req2: any = {
        body: {
            mobile: shopMobile,
            role: 'SHOP',
            // No district provided in body, should take from DA
        },
        user: { role: 'DISTRICT_ADMIN', district: 'Trivandrum' }
    };
    const res2 = mockRes();
    await inviteUser(req2, res2);

    if (res2.statusCode && res2.statusCode !== 200) {
        console.error("❌ Failed to invite Shop:", res2.data);
    } else {
        console.log("✅ Shop Invite Success:", res2.data?.message);
    }

    // Verify Shop DB Status and District Inheritance
    const shopUser = await prisma.user.findUnique({ where: { mobile: shopMobile } });
    if (shopUser?.status !== 'INVITED') {
        console.error("❌ Shop Status is NOT INVITED:", shopUser?.status);
    } else if (shopUser?.district !== 'Trivandrum') {
        console.error("❌ Shop did not inherit district:", shopUser?.district);
    } else {
        console.log("✅ Shop Status INVITED and District 'Trivandrum' inherited");
    }

    // 4. Test: Shop Claims Invite (Signup)
    console.log("Testing: Shop Claims Invite (Signup)...");
    const req3: any = {
        body: {
            shopName: "Test Shop " + randomSuffix,
            ownerName: "Test Owner",
            mobile: shopMobile,
            password: "newpassword123",
            district: "Trivandrum" // Signup sends district usually
        }
    };
    const res3 = mockRes();
    await signup(req3, res3);

    if (res3.statusCode && res3.statusCode !== 200) {
        console.error("❌ Shop Signup Failed:", res3.data);
    } else {
        console.log("✅ Shop Signup Success:", res3.data?.message || "Token received");
    }

    // Verify Shop Active and Shop Table Entry
    const shopFinal = await prisma.user.findUnique({ where: { mobile: shopMobile } });
    const shopEntry = await prisma.shop.findUnique({ where: { mobileNumber: shopMobile } });

    if (shopFinal?.status !== 'ACTIVE') console.error("❌ Shop User not ACTIVE");
    if (!shopEntry) console.error("❌ Shop Record not created");

    if (shopFinal?.status === 'ACTIVE' && shopEntry) {
        console.log("✅ Shop flow verified completely!");
    }
}

runTests()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
