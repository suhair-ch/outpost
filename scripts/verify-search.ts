
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

async function main() {
    console.log('--- Verifying Search ---');

    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/login`, { mobile: '9999999999', otp: '1234' });
        const { token } = loginRes.data;

        // 2. Search by Sender Mobile (Known mobile in seed data usually or previous tests)
        // Let's search for '9999999999' which surely exists as sender in some tests
        console.log("Searching for '9999999999'...");
        const res1 = await axios.get(`${API_URL}/parcels?search=9999999999`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`Results: ${res1.data.length}`);
        if (res1.data.length > 0) console.log('✅ Found matches for Mobile');
        else console.log('⚠️ No matches (might be empty db)');

        // 3. Search by ID if we found any
        if (res1.data.length > 0) {
            const id = res1.data[0].id;
            console.log(`Searching for ID '${id}'...`);
            const res2 = await axios.get(`${API_URL}/parcels?search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
            console.log(`Results: ${res2.data.length}`);
            if (res2.data.length === 1 && res2.data[0].id === id) console.log('✅ Found Exact Match by ID');
            else console.log('❌ ID Search Failed');
        }

        // 4. Search Garbage
        console.log("Searching for 'xyz123'...");
        const res3 = await axios.get(`${API_URL}/parcels?search=xyz123`, { headers: { Authorization: `Bearer ${token}` } });
        if (res3.data.length === 0) console.log('✅ Correctly found 0 results for garbage');
        else console.log('❌ Found results for garbage?!');

    } catch (e: any) {
        console.error(e.response?.data || e.message);
    }
}

main();
