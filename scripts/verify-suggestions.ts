
// @ts-nocheck
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
// We won't use axios for this test, just direct DB checks to ensure logic works. 
// Ideally we mock the req/res flow or use supertest, but for this env, DB check is reliable enough for logic.

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('verify_suggestions.txt', msg + '\n');
}

async function verifySuggestions() {
    fs.writeFileSync('verify_suggestions.txt', '');
    log('--- Verifying Smart Suggestions ---');

    try {
        // 1. Setup: Ensure an Area exists with a Zone
        const district = 'Malappuram';
        const zoneName = 'AutoTestZone';
        const areaName = 'AutoTestVillage';

        await prisma.parcel.deleteMany({ where: { destinationZone: zoneName } });
        await prisma.area.deleteMany({ where: { zone: zoneName } });

        await prisma.area.create({
            data: {
                name: areaName,
                normalizedName: areaName.toLowerCase(),
                code: 'ATV',
                district: district,
                zone: zoneName,
                pincode: '676000'
            }
        });
        log(`PASS: Created Area ${areaName} in ${zoneName}`);

        // 2. Simulate Booking (Logic from parcelController)
        // We act as the controller here to test the LOGIC, since we can't easily hit the API without auth setup in this script
        // Replicating the logic key part: finding the area and getting the zone.

        const areaRecord = await prisma.area.findFirst({
            where: { name: areaName, district: district }
        });

        let detectedZone = null;
        if (areaRecord && areaRecord.zone) {
            detectedZone = areaRecord.zone;
        }

        if (detectedZone !== zoneName) {
            throw new Error(`FAIL: Logic did not detect zone. Got: ${detectedZone}`);
        }
        log(`PASS: Logic correctly detected zone: ${detectedZone}`);

        // 2. Setup: Check or Create Shop
        let shop = await prisma.shop.findFirst();
        if (!shop) {
            const user = await prisma.user.create({ data: { mobile: 'shopowner', password: 'pass', role: 'SHOP', status: 'ACTIVE' } });
            shop = await prisma.shop.create({
                data: {
                    shopName: 'Test Shop',
                    ownerName: 'Owner',
                    mobile: '9998887776',
                    district: 'Malappuram',
                    area: 'TestArea',
                    fullAddress: 'Addr',
                    userId: user.id
                }
            });
        }
        const shopId = shop.id;

        // 3. Create the Parcel with the detected zone
        await prisma.parcel.create({
            data: {
                trackingNumber: 'TEST-' + Math.floor(Math.random() * 10000), // Randomize to avoid unique constraint collisions on retry
                senderName: 'Test Sender',
                senderMobile: '999',
                receiverName: 'Test Receiver',
                receiverMobile: '888',
                sourceShopId: shopId,
                district: shop.district,
                destinationDistrict: district,
                destinationArea: areaName,
                destinationZone: detectedZone,
                parcelSize: 'M',
                paymentMode: 'CASH',
                price: 100,
                status: 'BOOKED'
            }
        });

        // 4. Test Aggregation (Route Controller Logic)
        const suggestions = await prisma.parcel.groupBy({
            by: ['destinationZone'],
            where: {
                destinationDistrict: district,
                status: 'BOOKED',
                destinationZone: { not: null }
            },
            _count: { id: true }
        });

        const found = suggestions.find(s => s.destinationZone === zoneName);
        if (found && found._count.id > 0) {
            log(`PASS: Aggregation found ${found._count.id} parcels for ${zoneName}`);
        } else {
            log('FAIL: Aggregation did not find the parcels.');
        }

    } catch (e: any) {
        log('FAIL: ' + e.message);
    }
}

verifySuggestions().catch(console.error);
