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
            destinationDistrict, destinationArea, parcelSize, paymentMode, price
        } = req.body;

        const sourceShopId = req.user?.shopId;

        if (!sourceShopId && req.user?.role === 'SHOP') {
            return res.status(400).json({ error: 'Shop ID not found for user. Please re-login.' });
        }

        const finalShopId = sourceShopId || req.body.sourceShopId;

        if (!finalShopId) {
            return res.status(400).json({ error: 'Source Shop ID is required' });
        }

        // Fetch Shop to get District
        const shop = await prisma.shop.findUnique({
            where: { id: Number(finalShopId) }
        });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        // Generate Smart Tracking Number: DIST-AREA-####
        // e.g. MAL-PMN-1234
        const distCode = (destinationDistrict || 'KER').substring(0, 3).toUpperCase();
        let areaCode = 'HUB'; // Default

        if (destinationArea) {
            const areaRecord = await prisma.area.findFirst({
                where: {
                    name: destinationArea,
                    district: destinationDistrict // Ensure correct district context
                }
            });
            if (areaRecord?.code) {
                areaCode = areaRecord.code;
            } else {
                areaCode = destinationArea.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
            }
        }

        // Generate Sequential ID: DIST-AREA-0001
        // Robust Loop: Count existing, then check if that ID exists. If so, increment until free.
        let currentCount = await prisma.parcel.count();
        let nextSequence = currentCount + 1;
        let paddedSequence = String(nextSequence).padStart(4, '0');
        let trackingNumber = `${distCode}-${areaCode}-${paddedSequence}`;
        let isUnique = false;

        // Collision Check Loop (Safety for deleted rows)
        while (!isUnique) {
            const existing = await prisma.parcel.findUnique({ where: { trackingNumber } });
            if (!existing) {
                isUnique = true;
            } else {
                nextSequence++;
                paddedSequence = String(nextSequence).padStart(4, '0');
                trackingNumber = `${distCode}-${areaCode}-${paddedSequence}`;
            }
        }

        // Generate OTP
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const parcel = await prisma.parcel.create({
            data: {
                trackingNumber,
                senderName,
                senderMobile,
                receiverName,
                receiverMobile,
                sourceShopId: Number(finalShopId),
                district: shop.district,
                destinationDistrict,
                destinationArea,
                parcelSize,
                paymentMode,
                price,
                deliveryOtp,
                status: 'BOOKED'
            }
        });

        await notifyParcelParticipants(parcel, `Parcel #${parcel.trackingNumber} Booked! OTP: ${deliveryOtp}. Track: http://localhost:5173/tracking`);

        res.json(parcel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book parcel', details: (error as any).message });
    }
};

// Update Parcel Status
export const updateParcelStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const parcel = await prisma.parcel.update({
            where: { id: Number(id) },
            data: { status }
        });

        await notifyParcelParticipants(parcel, `Parcel #${id} Status Update: ${status}`);

        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update parcel status' });
    }
};

import { Role } from '../types';

// Get Parcels
export const listParcels = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const shopId = user?.shopId;

        let whereClause: any = {};
        const search = req.query.search as string;

        if (shopId) {
            whereClause = { sourceShopId: Number(shopId) };
        } else if (user?.role === Role.DISTRICT_ADMIN) {
            const u = user as any;
            if (!u.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            whereClause.OR = [
                { district: u.district },
                { destinationDistrict: u.district }
            ];

            if (req.query.shopId) {
                whereClause = { ...whereClause, sourceShopId: Number(req.query.shopId) };
            }
        }
        if (search) {
            whereClause = {
                ...whereClause,
                OR: [
                    { trackingNumber: { contains: search, mode: 'insensitive' } }, // Search by Tracking Code
                    { senderMobile: { contains: search } },
                    { receiverMobile: { contains: search } },
                    { deliveryOtp: { equals: search } }
                ].filter(Boolean) as any
            };
        }

        const parcels = await prisma.parcel.findMany({
            where: whereClause,
            include: { sourceShop: true },
            orderBy: { createdAt: 'desc' }
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
        // Allow fetch by ID or Tracking Number
        const parcel = await prisma.parcel.findFirst({
            where: {
                OR: [
                    { id: Number(id) || undefined }, // If id is number
                    { trackingNumber: String(id) }   // If id is string (tracking code)
                ]
            },
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
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await prisma.parcel.update({
            where: { id: Number(id) },
            data: { deliveryOtp: otp }
        });

        console.log(`[SMS] Delivery OTP for Parcel ${id}: ${otp}`);

        res.json({ message: 'OTP generated', otp });
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
                deliveryOtp: null
            }
        });

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

        if (req.user?.role === 'SHOP' && parcel.sourceShopId !== req.user.shopId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (req.user?.role === 'DISTRICT_ADMIN') {
            const user = req.user as any;
            const p = parcel as any;
            if (user.district !== p.district && user.district !== p.destinationDistrict) {
                return res.status(403).json({ error: 'Access denied (District Mismatch)' });
            }
        }

        const otp = parcel.deliveryOtp;
        if (!otp) return res.status(400).json({ error: 'No OTP exists for this parcel' });

        await sendSms(parcel.receiverMobile, `Your Delivery OTP for Parcel #${parcel.id} is: ${otp}`);

        res.json({ message: 'OTP Resent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
};
