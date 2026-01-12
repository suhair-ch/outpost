
const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('--- Starting Sharing Process ---');

    try {
        // 1. Start Backend Tunnel (Port 3002)
        console.log('Tunneling Backend (Port 3002)...');
        const backendTunnel = await localtunnel({ port: 3002 });
        const backendUrl = backendTunnel.url;
        console.log(`Backend Public URL: ${backendUrl}`);

        // 2. Update Frontend Config (client.ts) to point to Public Backend
        const clientPath = path.join(__dirname, '../frontend/src/api/client.ts');
        if (fs.existsSync(clientPath)) {
            let clientContent = fs.readFileSync(clientPath, 'utf8');
            // Replace baseURL logic 
            const newContent = clientContent.replace(/baseURL: '.*'/, `baseURL: '${backendUrl}/api'`);
            fs.writeFileSync(clientPath, newContent);
            console.log(`Updated frontend/src/api/client.ts to point to ${backendUrl}/api`);
        } else {
            console.error('Could not find client.ts to update!');
        }

        // 3. Start Frontend Tunnel (Port 5173)
        console.log('Tunneling Frontend (Port 5173)...');
        const frontendTunnel = await localtunnel({ port: 5173 });
        const frontendUrl = frontendTunnel.url;

        console.log('=================================================');
        console.log('🚀 APP IS LIVE FOR SHARING!');
        console.log('=================================================');
        console.log(`\n👉 SHARE THIS LINK WITH FRIENDS:\n${frontendUrl}\n`);
        console.log(`(Backend: ${backendUrl})`);
        console.log('=================================================');
        console.log('Press Ctrl+C to stop sharing.');

        // Keep process alive
        backendTunnel.on('close', () => console.log('Backend tunnel closed'));
        frontendTunnel.on('close', () => console.log('Frontend tunnel closed'));

        // Prevent script from exiting
        setInterval(() => { }, 1000);

    } catch (err) {
        console.error('Error starting tunnels:', err);
    }
}

main();
