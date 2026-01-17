
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3006/api';

async function verifySecureSetup() {
    console.log('--- Verifying Secure Setup Flow ---');

    const mobile = '9999988888';

    // Cleanup
    try {
        await prisma.shop.deleteMany({ where: { mobileNumber: mobile } });
        await prisma.user.deleteMany({ where: { mobile } });
    } catch (e) { console.log('Cleanup error ignored'); }

    // 1. Simulate Shop Creation (Admin Action: INVITED status)
    console.log('Step 1: Admin creating INVITED user in DB...');
    await prisma.user.create({
        data: {
            mobile: mobile,
            role: 'SHOP',
            district: 'Malappuram',
            status: 'INVITED',
            password: 'random_unknown_password_hash',
            otp: null
        }
    });
    console.log('PASS: User created.');

    // 2. Try Login with ANY password (should FAIL with REQUIRE_SETUP)
    console.log('Step 2: User tries login (expecting 403)...');
    try {
        await axios.post(`${BASE_URL}/login`, { mobile, password: 'password' });
        console.error('FAIL: Login should have been blocked!');
    } catch (e: any) {
        if (e.response?.data?.error === 'REQUIRE_SETUP') {
            console.log('PASS: Login Blocked with REQUIRE_SETUP');
        } else {
            console.error('FAIL: Wrong error', e.response?.data || e.message);
        }
    }

    // 3. Perform Setup (OTP + New Password)
    console.log('Step 3: User performs Setup...');
    // Wrong OTP Test
    try {
        await axios.post(`${BASE_URL}/auth/setup-account`, {
            mobile,
            otp: '12347',
            password: 'new_secure_password'
        });
        console.error('FAIL: Setup accepted wrong OTP!');
    } catch (e: any) {
        console.log('PASS: Wrong OTP rejected.');
    }

    // Correct OTP Test
    try {
        const res = await axios.post(`${BASE_URL}/auth/setup-account`, {
            mobile,
            otp: '1234',
            password: 'new_secure_password'
        });
        console.log('PASS: Setup Successful. Token received:', !!res.data.token);
        if (res.data.user.status !== 'ACTIVE') console.error('FAIL: Status not updated to ACTIVE');
    } catch (e: any) {
        throw e; // Check catch block below
    }

    // 4. Try Login with NEW password (should SUCCESS)
    console.log('Step 4: User login with NEW password...');
    try {
        const res = await axios.post(`${BASE_URL}/login`, { mobile, password: 'new_secure_password' });
        console.log('PASS: Login Successful!');
        console.log('Token:', !!res.data.token);
    } catch (e: any) {
        console.error('FAIL: Login failed', e.response?.data || e.message);
    }
}

verifySecureSetup().catch(err => {
    console.error('FATAL ERROR:', err.message);
    if (err.response) {
        console.error('Response Status:', err.response.status);
        console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
        console.error('No response received (Network Error?)');
    }
}).finally(() => prisma.$disconnect());
