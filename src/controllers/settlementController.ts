
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// Get Current Debt (What the Shop owes the Admin)
export const getShopEarnings = async (req: AuthRequest, res: Response) => {
    try {
        const { shopId } = req.params;

        const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        // details of parcels that are NOT yet settled
        const unsettledParcels = await prisma.parcel.findMany({
            where: {
                sourceShopId: Number(shopId),
                settlementId: null
            }
        });

        // 1. Total Cash the shop accepted from customers
        const totalCashCollected = unsettledParcels.reduce((sum, p) => sum + p.price, 0);

        // 2. Total Commission the shop earned
        const totalCommissionEarned = unsettledParcels.length * shop.commission;

        // 3. Net Amout: Shop owes this to Admin
        // (Cash they hold) - (Commission they keep)
        const netAmountToBePaid = totalCashCollected - totalCommissionEarned;

        // Fetch history
        const settlements = await prisma.settlement.findMany({
            where: { shopId: Number(shopId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            shop,
            unsettledStats: {
                parcelCount: unsettledParcels.length,
                totalCashCollected,
                totalCommissionEarned,
                netAmountToBePaid
            },
            settlements
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shop debt' });
    }
};

// Settle Debt (Collect Cash & Close Books)
export const markPaid = async (req: AuthRequest, res: Response) => {
    try {
        const { shopId } = req.body; // We don't need amount, we calculate it live

        const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        // 1. Find Unsettled Parcels
        const unsettledParcels = await prisma.parcel.findMany({
            where: {
                sourceShopId: Number(shopId),
                settlementId: null
            }
        });

        if (unsettledParcels.length === 0) {
            return res.status(400).json({ error: 'No unpaid parcels to settle.' });
        }

        // 2. Calculate Token
        const totalCashCollected = unsettledParcels.reduce((sum, p) => sum + p.price, 0);
        const totalCommissionEarned = unsettledParcels.length * shop.commission;
        const netAmountToBePaid = totalCashCollected - totalCommissionEarned;

        // 3. Create Settlement Record
        const settlement = await prisma.settlement.create({
            data: {
                shopId: Number(shopId),
                district: shop.district,
                totalCashCollected,
                totalCommissionEarned,
                netAmountToBePaid,
                periodStart: unsettledParcels[0].createdAt, // Oldest parcel
                periodEnd: new Date(),
                status: 'PAID'
            }
        });

        // 4. Update Parcels to link to this Settlement
        await prisma.parcel.updateMany({
            where: {
                sourceShopId: Number(shopId),
                settlementId: null
            },
            data: {
                settlementId: settlement.id
            }
        });

        res.json({ success: true, settlement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create settlement' });
    }
};
