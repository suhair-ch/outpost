
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

async function main() {
    try {
        // 1. Login as SHOP (Mobile: 8888888888, Role: SHOP) - Assuming this user exists or use one from check-users output
        console.log("Logging in as SHOP...");
        // Use a known shop mobile. From previous check-users output, we saw IDs but not full mobile list clearly.
        // Let's assume 8888888888 is a shop or try to create one if failing.
        // Actually, let's use the one logged in previous steps: '8888888888' is typical test shop.

        const loginRes = await axios.post(`${API_URL}/login`, {
            mobile: '8888888888',
            role: 'SHOP',
            otp: '1234'
        });

        const token = loginRes.data.token;
        console.log(`Logged in. Token: ${token.substring(0, 20)}... Role: ${loginRes.data.user.role}`);

        // 2. Try to verify delivery (using Parcel 12 and OTP 1234)
        console.log("Attempting to verify delivery...");
        const res = await axios.post(
            `${API_URL}/parcels/verify-delivery`,
            { id: 12, otp: '1234' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("SUCCESS!", res.data);

    } catch (error: any) {
        if (error.response) {
            console.error("FAILED Status:", error.response.status);
            console.error("FAILED Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

main();
