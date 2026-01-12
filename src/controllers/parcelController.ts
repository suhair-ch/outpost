import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { sendSms, notifyParcelParticipants } from '../services/smsService';

const prisma = new PrismaClient();

// Create/Book Parcel
export const bookParcel = async (req: AuthRequest, res: Response) => {
    try {
        const {
            senderName, senderMobile, receiverName, receiverMobile,
            destinationDistrict, parcelSize, paymentMode, price
        } = req.body;

        const sourceShopId = req.user?.shopId;

        if (!sourceShopId && req.user?.role === 'SHOP') {
            return res.status(400).json({ error: 'Shop ID not found for user. Please re-login.' });
        }

        // Admin might want to specify sourceShopId, but for MVP Shop books for themselves
        // If Admin books, sourceShopId must be provided in body? Let's assume Shop booking for now.
        const finalShopId = sourceShopId || req.body.sourceShopId;

        if (!finalShopId) {
            return res.status(400).json({ error: 'Source Shop ID is required' });
        }

        // Fetch Shop to get District
        const shop = await prisma.shop.findUnique({
            where: { id: Number(finalShopId) }
        });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

        const parcel = await prisma.parcel.create({
            data: {
                senderName, senderMobile, receiverName, receiverMobile,
                destinationDistrict, parcelSize, paymentMode, price,
                sourceShopId: Number(finalShopId),
                district: shop.district, // STRICT STAMPING
                status: 'BOOKED',
                deliveryOtp: otp // Store OTP immediately
            }
        });

        // Send SMS to both Sender and Receiver
        await notifyParcelParticipants(parcel, `Parcel #${parcel.id} Booked! OTP: ${otp}. Track: http://localhost:5173/tracking`);

        res.json(parcel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book parcel', details: (error as any).message });
    }
};

// Update Parcel Status (unchanged, but could add shop checks if needed)
export const updateParcelStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Allowed transitions validation could go here

        const parcel = await prisma.parcel.update({
            where: { id: Number(id) },
            data: { status }
        });

        // Notify
        await notifyParcelParticipants(parcel, `Parcel #${id} Status Update: ${status}`);

        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update parcel status' });
    }
};

import { Role } from '../types';

// Get Parcels (Admin sees all, Shop sees theirs)
export const listParcels = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const shopId = user?.shopId;

        let whereClause: any = {};
        const search = req.query.search as string; // Fix: Define search variable

        if (shopId) {
            // If Shop, forced scope
            whereClause = { sourceShopId: Number(shopId) };
        } else if (user?.role === Role.DISTRICT_ADMIN) {
            // District Admin scope: Strong check
            const u = user as any;
            if (!u.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            // Allow inbound OR outbound
            whereClause.OR = [
                { district: u.district },
                { destinationDistrict: u.district }
            ];

            if (req.query.shopId) {
                // Admin filtering by specific shop (Restricts to Outbound from that shop)
                whereClause = { ...whereClause, sourceShopId: Number(req.query.shopId) };
                // NOTE: If shopId is present, the OR logic might conflict? 
                // Wait. If shopId is set, it matches sourceShopId. 
                // Implicitly sourceShop.district must be user.district if the Shop is valid.
                // But listShops ensures they only see their shops.
                // So if they filter by Shop, they are looking at outbound.
                // The OR logic above works for generic lists. 
                // If Shop ID is added, Prims ANDs it. 
                // So (district=My OR dest=My) AND sourceShop=X.
                // Since Shop X is in My District (verified by UI filter), district=My is true.
                // So it works.
            }
        }
        if (search) {
            whereClause = {
                ...whereClause,
                OR: [
                    { id: !isNaN(Number(search)) ? Number(search) : undefined }, // Search by ID if number
                    { senderMobile: { contains: search } },
                    { receiverMobile: { contains: search } },
                    { deliveryOtp: { equals: search } }
                ].filter(Boolean) as any // Filter out undefined ID queries
            };
        }

        const parcels = await prisma.parcel.findMany({
            where: whereClause,
            include: { sourceShop: true },
            orderBy: { createdAt: 'desc' } // Good practice to show newest first
        });
        res.json(parcels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch parcels' });
    }
};

// Get Single Parcel
export const getParcelById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const parcel = await prisma.parcel.findUnique({
            where: { id: Number(id) },
            include: { sourceShop: true, route: true }
        });
        if (!parcel) return res.status(404).json({ error: 'Parcel not found' });
        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch parcel' });
    }
};

// Generate Delivery OTP
export const generateDeliveryOtp = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.body; // parcelId
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

        await prisma.parcel.update({
            where: { id: Number(id) },
            data: { deliveryOtp: otp }
        });

        // In real app, send SMS here.
        console.log(`[SMS] Delivery OTP for Parcel ${id}: ${otp}`);

        res.json({ message: 'OTP generated', otp }); // Return OTP for MVP demo
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
};

// Verify Delivery OTP
export const verifyDelivery = async (req: AuthRequest, res: Response) => {
    try {
        const { id, otp } = req.body;

        const parcel = await prisma.parcel.findUnique({ where: { id: Number(id) } });
        if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

        if (parcel.deliveryOtp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const updated = await prisma.parcel.update({
            where: { id: Number(id) },
            data: {
                status: 'DELIVERED',
                deliveryOtp: null // Clear OTP after use
            }
        });

        // Notify
        await notifyParcelParticipants(updated, `Parcel #${id} Delivered Successfully! Thank you using OutPost.`);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify delivery' });
    }
};

// Resend Delivery OTP
export const resendOtp = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const parcel = await prisma.parcel.findUnique({ where: { id: Number(id) } });

        if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

        // Security: Only Admin, District Admin (scoped), or Source Shop can resend
        if (req.user?.role === 'SHOP' && parcel.sourceShopId !== req.user.shopId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (req.user?.role === 'DISTRICT_ADMIN') {
            // Strict District Check
            const user = req.user as any;
            const p = parcel as any;
            if (user.district !== p.district && user.district !== p.destinationDistrict) {
                return res.status(403).json({ error: 'Access denied (District Mismatch)' });
            }
        }
        // Drivers cannot resend OTP (usually)

        const otp = parcel.deliveryOtp;
        if (!otp) return res.status(400).json({ error: 'No OTP exists for this parcel' });

        await sendSms(parcel.receiverMobile, `Your Delivery OTP for Parcel #${parcel.id} is: ${otp}`);

        res.json({ message: 'OTP Resent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
};
