
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// Get Shop Earnings (Unpaid Commissions)
export const getShopEarnings = async (req: AuthRequest, res: Response) => {
    try {
        const { shopId } = req.params;

        // Security Check: If role is SHOP, ensure they are requesting their own data
        if (req.user?.role === 'SHOP' && req.user.shopId !== Number(shopId)) {
            return res.status(403).json({ error: 'Access denied. You can only view your own earnings.' });
        }

        // Calculate total unpaid commission
        // Assuming commission is stored on Shop model as a rate, but we need to calculate based on parcels?
        // User requirements said "Settlement... total_commission".
        // Let's assume we sum up commissions for parcels that are DELIVERED and not yet settled?
        // Or just list pending settlements.

        // For MVP simplicity: Just return the commission rate and maybe a count of delivered parcels?
        // Actually, user asked for: GET /shops/{shop_id}/earnings

        // Let's implement a simple logic: 
        // Find all parcels from this shop that are DELIVERED.
        // Calculate total based on Shop's commission rate?
        // This is getting complex. Let's stick to what we have in Schema.

        // Schema has Settlement model. So maybe this just returns the Settlement history?
        // "Settlement APIs: GET /shops/{shop_id}/earnings"

        // Let's assume this returns a summary of pending payouts.
        const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        // Calculate Total Earnings (All time)
        // Commission is per parcel sent.
        const totalParcels = await prisma.parcel.count({
            where: { sourceShopId: Number(shopId) }
        });

        const totalEarnings = totalParcels * shop.commission;

        // Calculate Paid Amount
        const settlements = await prisma.settlement.findMany({
            where: { shopId: Number(shopId) }
        });

        const totalSettled = settlements.reduce((sum, s) => sum + s.totalCommission, 0);
        const pendingAmount = totalEarnings - totalSettled;

        res.json({
            shop,
            stats: {
                totalParcels,
                commissionRate: shop.commission,
                totalEarnings,
                totalSettled,
                pendingAmount
            },
            settlements
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch earnings' });
    }
};

// Mark Paid (Create Settlement)
export const markPaid = async (req: AuthRequest, res: Response) => {
    try {
        const { shopId, amount, periodStart, periodEnd } = req.body;

        const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const settlement = await prisma.settlement.create({
            data: {
                shopId: Number(shopId),
                totalCommission: Number(amount),
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                status: 'PAID',
                transactionId: `TXN-${Date.now()}`,
                district: (shop as any).district // Cast shop
            } as any // Cast data
        });
        res.json(settlement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as paid' });
    }
};
