
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public Track API
export const trackParcel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const parcel = await prisma.parcel.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                senderName: true,
                destinationDistrict: true,
                status: true,
                updatedAt: true
            }
        });

        if (!parcel) {
            return res.status(404).json({ error: 'Parcel not found' });
        }

        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: 'Tracking failed' });
    }
};
