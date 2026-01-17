
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3006/api';

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('verify_output.txt', msg + '\n');
}

async function verifySmartSignup() {
    fs.writeFileSync('verify_output.txt', ''); // Clear file
    log('--- Verifying Smart Signup Flow ---');

    // 1. Setup Test Data (Invite a DA and a Shop)
    const daMobile = '9999911111';
    const shopMobile = '9999922222';

    // Cleanup first
    try {
        await prisma.shop.deleteMany({ where: { mobileNumber: { in: [daMobile, shopMobile] } } });
        await prisma.user.deleteMany({ where: { mobile: { in: [daMobile, shopMobile] } } });
        log('Cleanup done.');
    } catch (e) {
        log('Cleanup error (ignorable).');
    }

    // Create Invites directly in DB (simulating successful invite)
    try {
        await prisma.user.create({
            data: {
                mobile: daMobile,
                role: 'DISTRICT_ADMIN',
                district: 'Malappuram',
                status: 'INVITED',
                password: 'hash', // Placeholder
            }
        });

        await prisma.user.create({
            data: {
                mobile: shopMobile,
                role: 'SHOP',
                district: 'Kozhikode',
                status: 'INVITED',
                password: 'hash',
            }
        });
        log('Invites created.');
    } catch (e: any) {
        log('Error creating invites: ' + e.message);
        return;
    }

    // 2. Test Step 1: Check Invite (DA)
    log('\nTesting Step 1 for DA...');
    try {
        const res = await axios.get(`${BASE_URL}/auth/check-invite/${daMobile}`);
        log('PASS: DA Invite Found: ' + JSON.stringify(res.data));
        if (res.data.role !== 'DISTRICT_ADMIN') log('FAIL: Wrong Role for DA');
    } catch (e: any) {
        log('FAIL: DA Check Failed: ' + JSON.stringify(e.response?.data || e.message));
    }

    // 3. Test Step 1: Check Invite (Shop)
    log('\nTesting Step 1 for Shop...');
    try {
        const res = await axios.get(`${BASE_URL}/auth/check-invite/${shopMobile}`);
        log('PASS: Shop Invite Found: ' + JSON.stringify(res.data));
        if (res.data.role !== 'SHOP') log('FAIL: Wrong Role for Shop');
    } catch (e: any) {
        log('FAIL: Shop Check Failed: ' + JSON.stringify(e.response?.data || e.message));
    }

    // 4. Test Step 2: Signup DA (No Shop Name)
    log('\nTesting Signup DA (Should succeed without shop details)...');
    try {
        const res = await axios.post(`${BASE_URL}/auth/signup`, {
            mobile: daMobile,
            password: 'password123',
            district: 'Malappuram' // Frontend passes this from check-invite result
        });
        log('PASS: DA Signup Success: ' + res.data.user.status);
    } catch (e: any) {
        log('FAIL: DA Signup Failed: ' + JSON.stringify(e.response?.data || e.message));
    }

    // 5. Test Step 2: Signup Shop (Missing Shop Name - Should Fail)
    log('\nTesting Signup Shop (Missing Shop Name - Should Fail)...');
    try {
        await axios.post(`${BASE_URL}/auth/signup`, {
            mobile: shopMobile,
            password: 'password123',
            district: 'Kozhikode'
        });
        log('FAIL: Shop Signup succeeded without shop name!');
    } catch (e: any) {
        if (e.response?.status === 400) {
            log('PASS: Correctly rejected missing shop name');
        } else {
            log('FAIL: Unexpected error for missing shop: ' + JSON.stringify(e.response?.data || e.message));
        }
    }

    // 6. Test Step 2: Signup Shop (Correct)
    log('\nTesting Signup Shop (Correct details)...');
    try {
        const res = await axios.post(`${BASE_URL}/auth/signup`, {
            mobile: shopMobile,
            password: 'password123',
            district: 'Kozhikode',
            shopName: 'Test Shop',
            ownerName: 'Test Owner'
        });
        log('PASS: Shop Signup Success: ' + res.data.user.status);
        log('PASS: Shop ID: ' + res.data.shopId);
    } catch (e: any) {
        log('FAIL: Shop Signup Failed: ' + JSON.stringify(e.response?.data || e.message));
    }
}

verifySmartSignup().catch(err => log('FATAL ERROR: ' + err.message));
