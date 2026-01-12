
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getDailyStats = async (req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const shopId = req.user?.shopId;
        const whereShop = shopId ? { sourceShopId: shopId } : {};

        const booked = await prisma.parcel.count({
            where: {
                ...whereShop,
                createdAt: { gte: today },
                status: 'BOOKED'
            }
        });

        const delivered = await prisma.parcel.count({
            where: {
                ...whereShop,
                updatedAt: { gte: today },
                status: 'DELIVERED'
            }
        });

        const totalParcels = await prisma.parcel.count({
            where: {
                ...whereShop,
                createdAt: { gte: today }
            }
        });

        res.json({ date: today, booked, delivered, total: totalParcels });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
};

import { Role } from '../types';

// District Performance (Revenue & Volume)
export const getDistrictStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const whereClause: any = {};

        // Strict Scoping for District Admin
        if (user?.role === Role.DISTRICT_ADMIN) {
            const u = user as any;
            if (!u.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            whereClause.district = u.district;
        }

        // Fetch parcels (using new direct district field)
        const parcels = await prisma.parcel.findMany({
            where: whereClause
            // select removed to avoid type error if strict
        });

        // Aggregate JS
        const stats: Record<string, { district: string, revenue: number, count: number }> = {};

        parcels.forEach(parcel => {
            const p = parcel as any;
            const dist = p.district || 'Unknown';
            if (!stats[dist]) {
                stats[dist] = { district: dist, revenue: 0, count: 0 };
            }
            stats[dist].revenue += p.price;
            stats[dist].count += 1;
        });

        // Convert to Array & Sort by Revenue
        const result = Object.values(stats).sort((a, b) => b.revenue - a.revenue);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch district stats' });
    }
};
