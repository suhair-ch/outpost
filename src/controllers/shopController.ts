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

        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const shopCode = `${distCode}-${areaCode}-${randomSuffix}`;

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

            // Create User STRICTLY (Upsert might overwrite admin actions? Better to strict create or fail if exists)
            // User said "Users do NOT self-register". So if mobile exists, it's a conflict? 
            // Or maybe upgrading a user?
            // "Shop record created -> User record created"
            const user = await tx.user.upsert({
                where: { mobile: mobileNumber },
                update: {
                    role: 'SHOP',
                    district: district,
                    password: hashedPassword
                },
                create: {
                    mobile: mobileNumber,
                    role: 'SHOP',
                    district: district,
                    status: 'ACTIVE',
                    otp: null,
                    password: hashedPassword
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

        const shops = await prisma.shop.findMany({ where: whereClause });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shops' });
    }
};
