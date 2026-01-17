import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createShop = async (req: AuthRequest, res: Response) => {
    try {
        let { shopName, ownerName, mobileNumber, district, commission, isHub, area } = req.body;

        // Security: If creator is District Admin, force the district
        if (req.user?.role === 'DISTRICT_ADMIN') {
            district = req.user.district; // Force their district
        }

        // Generate Shop Code with Area Code
        // e.g. MAL-PMN-1234 (District - Area - Random)
        const distCode = (district || 'KER').substring(0, 3).toUpperCase();
        let areaCode = isHub ? 'HUB' : 'SHP';

        if (area && district) {
            // Try to find the official Area Code
            const areaRecord = await prisma.area.findFirst({
                where: {
                    name: area,
                    district: district
                }
            });
            if (areaRecord?.code) {
                areaCode = areaRecord.code;
            } else {
                // Fallback: Generate generic code from name
                areaCode = area.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
            }
        }

        // Generate Sequential Shop Code: DIST-AREA-001
        // 1. Determine Prefix
        const prefix = `${distCode}-${areaCode}`;

        // 2. Count existing shops with this prefix to determine next sequence
        // Note: In high concurrency, this needs a DB sequence or locking. For MVP, loop-check is sufficient.
        const existingCount = await prisma.shop.count({
            where: {
                shopCode: {
                    startsWith: prefix
                }
            }
        });

        let nextSequence = existingCount + 1;
        let shopCode = `${prefix}-${String(nextSequence).padStart(3, '0')}`;
        let isUnique = false;

        // 3. Collision Check Loop
        while (!isUnique) {
            const existing = await prisma.shop.findUnique({ where: { shopCode } });
            if (!existing) {
                isUnique = true;
            } else {
                nextSequence++;
                shopCode = `${prefix}-${String(nextSequence).padStart(3, '0')}`;
            }
        }

        // Hash Temp Password
        const hashedPassword = await bcrypt.hash('1234', 10);

        // Create Shop and User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const shop = await tx.shop.create({
                data: {
                    shopCode,
                    shopName,
                    ownerName,
                    mobileNumber,
                    district,
                    area, // Save the area name
                    commission: commission || 0.0,
                    isHub: isHub || false
                }
            });

            // Create User STRICTLY
            // 1. Generate a random password (UUID or Random Bytes) - User NEVER knows this
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedRandomPassword = await bcrypt.hash(randomPassword, 10);

            const user = await tx.user.upsert({
                where: { mobile: mobileNumber },
                update: {
                    role: 'SHOP',
                    district: district,
                },
                create: {
                    mobile: mobileNumber,
                    role: 'SHOP',
                    district: district,
                    status: 'INVITED', // <--- Key Change
                    otp: null,
                    password: hashedRandomPassword // <--- Key Change
                }
            });

            return { ...shop, tempPassword: '1234' };
        });

        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create shop', details: error.message });
    }
};

import { Role } from '../types';

export const listShops = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        let whereClause: any = {};

        if (user?.role === Role.DISTRICT_ADMIN) {
            if (!user.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            whereClause.district = user.district;
        }

        const shops = await prisma.shop.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        // Enrich with User Status (INVITED vs ACTIVE)
        const enrichedShops = await Promise.all(shops.map(async (shop) => {
            const shopUser = await prisma.user.findUnique({
                where: { mobile: shop.mobileNumber },
                select: { status: true }
            });
            return {
                ...shop,
                userStatus: shopUser?.status || 'UNKNOWN'
            };
        }));

        res.json(enrichedShops);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shops' });
    }
};
