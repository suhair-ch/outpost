
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3006';
const SUPER_ADMIN_MOBILE = '9999999999'; // Adjust if needed
const SUPER_ADMIN_OTP = '1234';

// Test Data
const DISTRICT_ADMIN_MOBILE = '8888888888';
const SHOP_MOBILE = '7777777777';
const RANDOM_MOBILE = '6666666666';

async function runTest() {
    console.log('🚀 Starting Invite-Only System Verification...\n');

    try {
        // 1. Login as Super Admin
        console.log('1️⃣ Logging in as Super Admin...');
        const adminLogin = await axios.post(`${API_URL}/login`, {
            mobile: SUPER_ADMIN_MOBILE,
            otp: SUPER_ADMIN_OTP
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Logged In\n');

        // 2. Admin invites District Admin
        console.log('2️⃣ Admin inviting District Admin...');
        try {
            await axios.post(`${API_URL}/auth/invite`, {
                mobile: DISTRICT_ADMIN_MOBILE,
                role: 'DISTRICT_ADMIN',
                district: 'Kerala'
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('✅ District Admin Invite Sent\n');
        } catch (e: any) {
            if (e.response?.data?.error === 'User already exists') {
                console.log('⚠️ District Admin already exists (Skipping Invite)\n');
            } else {
                throw e;
            }
        }

        // 3. Login as District Admin (DA)
        console.log('3️⃣ Logging in as District Admin...');
        // Note: In real flow, DA needs to set password first. 
        // For this test script, assuming MVP flow where invite immediately allows login if OTP/Password set?
        // Actually, invite sets status=INVITED. They need to 'Signup' to activate?
        // Wait, the backend logic for 'inviteUser' creates a user with status 'INVITED'. 
        // 'login' checks if user exists. If password not set, it might fail?
        // Let's check `authController.ts`. 
        // If password flow: fails if no password.
        // If OTP flow: succeeds if user exists and OTP matches '1234'.
        // So DA can login via OTP immediately after invite.

        const daLogin = await axios.post(`${API_URL}/login`, {
            mobile: DISTRICT_ADMIN_MOBILE,
            otp: '1234'
        });
        const daToken = daLogin.data.token;
        console.log('✅ District Admin Logged In');
        console.log(`   District: ${daLogin.data.district} (Should be 'Kerala')\n`);


        // 4. District Admin invites Shop
        console.log('4️⃣ District Admin inviting Shop...');
        try {
            await axios.post(`${API_URL}/auth/invite`, {
                mobile: SHOP_MOBILE,
                role: 'SHOP',
                // District should be auto-assigned or validated
            }, { headers: { Authorization: `Bearer ${daToken}` } });
            console.log('✅ Shop Invite Sent\n');
        } catch (e: any) {
            if (e.response?.data?.error === 'User already exists') {
                console.log('⚠️ Shop already exists (Skipping Invite)\n');
            } else {
                throw e;
            }
        }


        // 5. Try Sign Up as Random User (Should Fail)
        console.log('5️⃣ Attempting Random User Signup (Expected to FAIL)...');
        try {
            await axios.post(`${API_URL}/auth/signup`, {
                shopName: 'Hacker Shop',
                ownerName: 'Mr Hacker',
                mobile: RANDOM_MOBILE,
                password: 'password123',
                district: 'Kerala'
            });
            console.error('❌ FAIL: Random User was able to sign up!');
        } catch (e: any) {
            console.log(`✅ SUCCESS: Random User blocked. Error: ${e.response?.data?.error}\n`);
        }

        // 6. Try Sign Up as Invited Shop (Should Succeed)
        console.log('6️⃣ Attempting Invited Shop Signup (Expected to SUCCEED)...');
        try {
            const signupRes = await axios.post(`${API_URL}/auth/signup`, {
                shopName: 'Valid Shop',
                ownerName: 'Mrs Valid',
                mobile: SHOP_MOBILE,
                password: 'securepassword',
                district: 'Kerala'
            });
            console.log('✅ SUCCESS: Shop Signed Up');
            console.log(`   Shop ID: ${signupRes.data.shopId}`);
            console.log(`   Status: ${signupRes.data.user.status}\n`);
        } catch (e: any) {
            if (e.response?.data?.error === 'Account already active. Please Login.') {
                console.log('✅ Shop already active (succeeded previously)\n');
            } else {
                console.error('❌ FAIL: Shop Signup Failed', e.response?.data || e.message);
            }
        }

        console.log('🎉 Verification Complete!');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

runTest();
