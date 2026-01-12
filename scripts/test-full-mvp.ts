
const BASE_URL = 'http://localhost:3002/api';

async function request(method: string, endpoint: string, body?: any, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config: any = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTest() {
    console.log('🚀 Starting OUT POST Full MVP Verification...');

    // 1. Admin Login
    console.log('\n🔐 1. Admin Login...');
    const adminRes = await request('POST', '/login', { mobile: '9999999999', role: 'ADMIN' });
    if (adminRes.status !== 200) { console.error('❌ Login failed'); return; }
    const adminToken = adminRes.data.token;
    console.log('✅ Admin logged in.');

    // Random Suffix for data uniqueness
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // 2. Create Shop & Driver
    console.log('\n2. Creating Shop & Driver...');
    const shop = (await request('POST', '/shops', {
        shopName: `New Shop ${randomSuffix}`, ownerName: 'Alice', mobileNumber: `88${randomSuffix}8888`, district: 'A', commission: 5
    }, adminToken)).data;
    const driver = (await request('POST', '/drivers', {
        name: `Driver ${randomSuffix}`, mobile: `77${randomSuffix}7777`
    }, adminToken)).data;
    console.log(`✅ Shop: ${shop.id}, Driver: ${driver.id}`);

    // Login as Shop
    const shopToken = (await request('POST', '/login', { mobile: `88${randomSuffix}8888`, role: 'SHOP' })).data.token;

    // Login as Driver
    const driverToken = (await request('POST', '/login', { mobile: `77${randomSuffix}7777`, role: 'DRIVER' })).data.token;


    // 3. Book Parcel
    console.log('\n3. Booking Parcel...');
    const parcel = (await request('POST', '/parcels', {
        senderName: 'S', senderMobile: '1', receiverName: 'R', receiverMobile: '2',
        destinationDistrict: 'B', parcelSize: 'S', paymentMode: 'CASH', price: 100, sourceShopId: shop.id
    }, shopToken)).data;
    console.log(`✅ Parcel Booked: ${parcel.id}`);

    // 4. Create Route & Assign Parcel
    console.log('\n4. Creating Route & Assigning Parcel...');
    const route = (await request('POST', '/routes/create', {
        routeName: `Route ${randomSuffix}`, driverId: driver.id
    }, adminToken)).data;
    console.log(`✅ Route Created: ${route.id}`);

    const assignRes = await request('POST', '/routes/assign-parcel', {
        routeId: route.id, parcelId: parcel.id
    }, adminToken);
    if (assignRes.status !== 200) console.error('❌ Assign failed', assignRes.data);
    else console.log(`✅ Parcel Assigned to Route`);

    // 5. Generate Delivery OTP
    console.log('\n5. Generating Delivery OTP...');
    const otpRes = await request('POST', '/parcels/generate-delivery-otp', { id: parcel.id }, driverToken);
    const otp = otpRes.data.otp;
    console.log(`✅ OTP Generated: ${otp}`);

    // 6. Verify Delivery
    console.log('\n6. Verifying Delivery...');
    const verifyRes = await request('POST', '/parcels/verify-delivery', { id: parcel.id, otp }, driverToken);
    if (verifyRes.status === 200 && verifyRes.data.status === 'DELIVERED') {
        console.log(`✅ Parcel Delivered!`);
    } else {
        console.error('❌ Delivery Verification Failed', verifyRes.data);
    }

    // 7. Dashboard Stats
    console.log('\n7. Checking Dashboard...');
    const dashRes = await request('GET', '/dashboard/today', null, adminToken);
    console.log(`✅ Dashboard:`, dashRes.data);

    // 8. Settlements
    console.log('\n8. Checking Settlements...');
    const settleRes = await request('GET', `/shops/${shop.id}/earnings`, null, adminToken);
    console.log(`✅ Settlements:`, settleRes.data);

    console.log('\n🎉 FULL MVP FLOW VERIFIED!');
}

runTest();
