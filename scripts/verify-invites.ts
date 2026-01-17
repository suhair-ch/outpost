
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3006/api';

async function verifyInviteStatus() {
    console.log('--- Verifying Invite Status ---');

    // 1. Create a dummy INVITED shop
    const mobile = '9991112222';
    try {
        await prisma.shop.deleteMany({ where: { mobileNumber: mobile } });
        await prisma.user.deleteMany({ where: { mobile } });
    } catch { }

    // Login as Admin to get Token
    const loginRes = await axios.post(`${BASE_URL}/login`, { mobile: '9999911111', password: 'password' });
    const token = loginRes.data.token;

    // Create Shop (which creates User as INVITED)
    await axios.post(`${BASE_URL}/shops`, {
        shopName: 'Test Invite Shop',
        ownerName: 'Mr. Test',
        mobileNumber: mobile,
        district: 'Malappuram',
        area: 'ManjeriS'
    }, { headers: { Authorization: `Bearer ${token}` } });

    // 2. Fetch List
    const listRes = await axios.get(`${BASE_URL}/shops`, { headers: { Authorization: `Bearer ${token}` } });

    // 3. Check for userStatus
    const ourShop = listRes.data.find((s: any) => s.mobileNumber === mobile);

    if (ourShop && ourShop.userStatus === 'INVITED') {
        console.log('PASS: Shop found with status INVITED');
    } else {
        console.error('FAIL: Status mismatch', ourShop?.userStatus);
    }

    // Cleanup
    await prisma.shop.deleteMany({ where: { mobileNumber: mobile } });
    await prisma.user.deleteMany({ where: { mobile } });
}

verifyInviteStatus().catch(console.error).finally(() => prisma.$disconnect());
