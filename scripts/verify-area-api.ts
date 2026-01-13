
import axios from 'axios';

const BASE_URL = 'http://localhost:3006/api';

async function verify() {
    console.log("Testing Districts...");
    try {
        const dRes = await axios.get(`${BASE_URL}/locations/districts`);
        console.log("Districts:", dRes.data);
        if (!Array.isArray(dRes.data) || dRes.data.length === 0) throw new Error("No districts returned");

        const firstDistrict = dRes.data[0];
        console.log(`Testing Areas for ${firstDistrict}...`);
        const aRes = await axios.get(`${BASE_URL}/locations/areas?district=${firstDistrict}`);
        console.log(`Areas in ${firstDistrict}:`, aRes.data.map((a: any) => a.name).slice(0, 5));

        if (!Array.isArray(aRes.data) || aRes.data.length === 0) throw new Error("No areas returned");

        console.log("✅ API Verification Successful");
    } catch (error: any) {
        console.error("❌ API Verification Failed:", error.message, error.response?.data);
        process.exit(1); // Ensure exit 1 on failure
    }
}

verify();
