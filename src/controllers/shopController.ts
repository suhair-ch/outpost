import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const createShop = async (req: AuthRequest, res: Response) => {
    try {
        const { shopName, ownerName, mobileNumber, district, commission } = req.body;
        // Create Shop and User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const shop = await tx.shop.create({
                data: {
                    shopName,
                    ownerName,
                    mobileNumber,
                    district,
                    commission: commission || 0.0
                }
            });

            // Check if user exists, if not create
            const user = await tx.user.upsert({
                where: { mobile: mobileNumber },
                update: {}, // If exists, do nothing (or update role?)
                create: {
                    mobile: mobileNumber,
                    role: 'SHOP',
                    district: district,
                    status: 'ACTIVE',
                    otp: '1234' // Default OTP
                }
            });

            return shop;
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
