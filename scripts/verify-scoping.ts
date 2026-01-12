
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

async function main() {
    console.log('--- Verifying District Admin Scoping ---');

    try {
        // 1. Login as District Admin (Ernakulam)
        console.log('Logging in as District Admin (9000090000)...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            mobile: '9000090000',
            password: 'password123'
        });
        const { token, user } = loginRes.data;
        console.log(`Login Success. Role: ${user.role}, District: ${user.district}`);

        // 2. List Shops
        console.log('Fetching Shops...');
        const shopsRes = await axios.get(`${API_URL}/shops`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Shops Found: ${shopsRes.data.length}`);
        shopsRes.data.forEach((s: any) => {
            console.log(` - ${s.shopName} (${s.district})`);
        });

        // Verification Logic
        const allErnakulam = shopsRes.data.every((s: any) => s.district === 'Ernakulam');
        if (allErnakulam && shopsRes.data.length > 0) {
            console.log('✅ PASSED: Only Ernakulam shops visible.');
        } else if (shopsRes.data.length === 0) {
            console.log('⚠️ Warning: No shops found (Maybe expected if none in Ernakulam?)');
        } else {
            console.log('❌ FAILED: Found shops from other districts!');
        }

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();
