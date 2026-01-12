import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

import { Role } from '../types';

export const createDriver = async (req: AuthRequest, res: Response) => {
    try {
        const { name, mobile, district } = req.body;
        // Create Driver and User in transaction
        const result = await prisma.$transaction(async (tx) => {
            const driver = await tx.driver.create({
                data: {
                    name,
                    mobile,
                    district: district || 'Unknown'
                }
            });

            // Check if user exists, if not create
            const user = await tx.user.upsert({
                where: { mobile: mobile },
                update: {},
                create: {
                    mobile: mobile,
                    role: 'DRIVER',
                    district: district || 'Unknown',
                    status: 'ACTIVE',
                    otp: '1234'
                }
            });

            return driver;
        });

        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create driver', details: error.message });
    }
};

export const listDrivers = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        let whereClause: any = {};

        if (user?.role === Role.DISTRICT_ADMIN) {
            if (!user.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            whereClause.district = user.district;
        }

        const drivers = await prisma.driver.findMany({ where: whereClause });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
};
