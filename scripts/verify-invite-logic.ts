
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

    // 2.1 Negative Test: DA invites DA
    console.log("Testing Negative: DA invites DA...");
    const reqNeg1: any = {
        body: { mobile: `fake${randomSuffix}`, role: 'DISTRICT_ADMIN', district: 'Trivandrum' },
        user: { role: 'DISTRICT_ADMIN', district: 'Trivandrum' }
    };
    const resNeg1 = mockRes();
    await inviteUser(reqNeg1, resNeg1);
    if (resNeg1.statusCode === 403) console.log("✅ Blocked DA -> DA invite");
    else console.error("❌ Failed to block DA -> DA invite", resNeg1.statusCode);

    // 2.2 Negative Test: Super Admin invites Shop
    console.log("Testing Negative: Super Admin invites Shop...");
    const reqNeg2: any = {
        body: { mobile: `fake2${randomSuffix}`, role: 'SHOP' },
        user: { role: 'SUPER_ADMIN' }
    };
    const resNeg2 = mockRes();
    await inviteUser(reqNeg2, resNeg2);
    if (resNeg2.statusCode === 403) console.log("✅ Blocked SA -> Shop invite");
    else console.error("❌ Failed to block SA -> Shop invite", resNeg2.statusCode);

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

    // 5. Negative Test: Shop invites anyone
    console.log("Testing Negative: Shop invites anyone...");
    const reqNeg3: any = {
        body: { mobile: `fake3${randomSuffix}`, role: 'SHOP' },
        user: { role: 'SHOP' }
    };
    const resNeg3 = mockRes();
    await inviteUser(reqNeg3, resNeg3);
    if (resNeg3.statusCode === 403) console.log("✅ Blocked Shop -> User invite");
    else console.error("❌ Failed to block Shop -> User invite", resNeg3.statusCode);
}

runTests()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
