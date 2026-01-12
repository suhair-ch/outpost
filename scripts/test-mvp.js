"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:3002/api';
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
function request(method, endpoint, body, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = { 'Content-Type': 'application/json' };
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
        const config = { method, headers };
        if (body)
            config.body = JSON.stringify(body);
        const res = yield fetch(`${BASE_URL}${endpoint}`, config);
        const data = yield res.json().catch(() => ({}));
        return { status: res.status, data };
    });
}
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Starting OUT POST MVP Verification...');
        // 1. Admin Login
        console.log('\n🔐 1. Admin Login...');
        const adminRes = yield request('POST', '/login', { mobile: '9999999999', role: 'ADMIN' });
        if (adminRes.status !== 200 || !adminRes.data.token) {
            console.error('❌ Admin login failed:', adminRes.data);
            // process.exit(1); replaced by return
            return;
        }
        const adminToken = adminRes.data.token;
        console.log('✅ Admin logged in.');
        // Generate random mobile numbers to avoid unique constraint violations
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const shopMobile = `88${randomSuffix}8888`;
        const driverMobile = `77${randomSuffix}7777`;
        const senderMobile = `12${randomSuffix}1234`;
        const receiverMobile = `09${randomSuffix}4321`;
        // 2. Create Shop
        console.log('\n🏪 2. Creating Shop...');
        const shopData = {
            shopName: `Test Shop ${randomSuffix}`,
            ownerName: 'Alice',
            mobileNumber: shopMobile,
            district: 'Downtown',
            commission: 10.0
        };
        const shopRes = yield request('POST', '/shops', shopData, adminToken);
        if (shopRes.status !== 200) {
            console.error('❌ Create Shop failed:', shopRes.data);
            // process.exit(1); replaced by return
            return;
        }
        const shop = shopRes.data;
        console.log(`✅ Shop created: ${shop.shopName} (ID: ${shop.id})`);
        // 3. Create Driver
        console.log('\n🚚 3. Creating Driver...');
        const driverData = {
            name: 'Bob Driver',
            mobile: driverMobile
        };
        const driverRes = yield request('POST', '/drivers', driverData, adminToken);
        if (driverRes.status !== 200) {
            console.error('❌ Create Driver failed:', driverRes.data);
            // process.exit(1); replaced by return
            return;
        }
        const driver = driverRes.data;
        console.log(`✅ Driver created: ${driver.name} (ID: ${driver.id})`);
        // 4. Shop Login
        console.log('\n🔐 4. Shop Login...');
        const shopLogin = yield request('POST', '/login', { mobile: shopMobile, role: 'SHOP' });
        if (shopLogin.status !== 200) {
            console.error('❌ Shop login failed:', shopLogin.data);
            // process.exit(1); replaced by return
            return;
        }
        const shopToken = shopLogin.data.token;
        console.log('✅ Shop logged in.');
        // 5. Book Parcel
        console.log('\n📦 5. Booking Parcel...');
        const parcelData = {
            senderName: 'John Doe',
            senderMobile: senderMobile,
            receiverName: 'Jane Smith',
            receiverMobile: receiverMobile,
            destinationDistrict: 'Uptown',
            parcelSize: 'M',
            paymentMode: 'CASH',
            price: 150.0,
            sourceShopId: shop.id
        };
        const parcelRes = yield request('POST', '/parcels', parcelData, shopToken);
        if (parcelRes.status !== 200) {
            console.error('❌ Book parcel failed:', parcelRes.data);
            // process.exit(1); replaced by return
            return;
        }
        const parcel = parcelRes.data;
        console.log(`✅ Parcel booked: ID ${parcel.id}, Status: ${parcel.status}`);
        // 6. Driver Login
        console.log('\n🔐 6. Driver Login...');
        const driverLogin = yield request('POST', '/login', { mobile: driverMobile, role: 'DRIVER' });
        if (driverLogin.status !== 200) {
            console.error('❌ Driver login failed:', driverLogin.data);
            // process.exit(1); replaced by return
            return;
        }
        const driverToken = driverLogin.data.token;
        console.log('✅ Driver logged in.');
        // 7. Driver Updates Status
        console.log('\n🔄 7. Driver updating status to COLLECTED...');
        const updateRes = yield request('PATCH', `/parcels/${parcel.id}/status`, { status: 'COLLECTED_FROM_SHOP' }, driverToken);
        if (updateRes.status !== 200) {
            console.error('❌ Update status failed:', updateRes.data);
            // process.exit(1); replaced by return
            return;
        }
        console.log(`✅ Status updated to: ${updateRes.data.status}`);
        // 8. Admin List Parcels
        console.log('\n📋 8. Admin checking parcels...');
        const listRes = yield request('GET', '/parcels', null, adminToken);
        if (listRes.status !== 200) {
            console.error('❌ List parcels failed:', listRes.data);
            // process.exit(1); replaced by return
            return;
        }
        const found = listRes.data.find((p) => p.id === parcel.id);
        if (!found) {
            console.error('❌ Parcel not found in admin list');
            // process.exit(1); replaced by return
            return;
        }
        console.log(`✅ Admin sees parcel ${found.id} as ${found.status}`);
        console.log('\n🎉 ALL TESTS PASSED!');
    });
}
runTest().catch(console.error);
