
import axios from 'axios';

const LOCAL_URL = 'http://localhost:3002/api/health'; // Assuming we have health check or just /
const TUNNEL_URL = 'https://eleven-heads-retire.loca.lt/api';

async function main() {
    console.log('--- Diagnosis ---');

    // 1. Check Local Backend
    try {
        console.log('Checking Local Backend...');
        // Just try hitting root or non-existent endpoint to check liveness
        await axios.get('http://localhost:3004/');
        console.log('✅ Local Backend is UP');
    } catch (e: any) {
        if (e.code === 'ECONNREFUSED') console.log('❌ Local Backend is DOWN');
        else console.log('✅ Local Backend is UP (responded)');
    }

    // 2. Check Tunnel URL
    try {
        console.log(`Checking Tunnel: ${TUNNEL_URL}...`);
        await axios.get(TUNNEL_URL, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        console.log('✅ Tunnel is UP');
    } catch (e: any) {
        console.log(`❌ Tunnel might be DOWN or expired. Status: ${e.response?.status} - ${e.message}`);
    }
}

main();
