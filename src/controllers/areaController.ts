import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// Get unique list of Districts from Area Master
export const getDistricts = async (req: Request, res: Response) => {
    try {
        const districts = await prisma.area.findMany({
            select: { district: true },
            distinct: ['district'],
            orderBy: { district: 'asc' }
        });

        // Return array of strings
        res.json(districts.map((d: { district: string }) => d.district));
    } catch (error) {
        console.error("Get Districts Error:", error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
};

// Get Areas (Optionally filtered by District and Zone)
export const getAreas = async (req: Request, res: Response) => {
    try {
        const { district, zone } = req.query;

        const where: any = { isActive: true };

        if (district && typeof district === 'string') {
            where.district = district;
        }

        if (zone && typeof zone === 'string') {
            where.zone = zone;
        }

        const areas = await prisma.area.findMany({
            where,
            orderBy: [{ district: 'asc' }, { name: 'asc' }]
        });

        res.json(areas);
    } catch (error) {
        console.error("Get Areas Error:", error);
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
};

// Get Unique Zones for a District
export const getZones = async (req: Request, res: Response) => {
    try {
        const { district } = req.query;

        if (!district || typeof district !== 'string') {
            return res.status(400).json({ error: 'District is required' });
        }

        const zones = await prisma.area.findMany({
            where: {
                district,
                zone: { not: null }
            },
            select: { zone: true },
            distinct: ['zone'],
            orderBy: { zone: 'asc' }
        });

        res.json(zones.map(z => z.zone));
    } catch (error) {
        console.error("Get Zones Error:", error);
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
};

// Create New Area
export const createArea = async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, pincode, district, zone } = req.body; // Added zone
        const user = req.user;

        // 1. Authorization & District Scope
        let targetDistrict = district;

        if (user?.role === 'DISTRICT_ADMIN') {
            if (!user.district) return res.status(403).json({ error: 'Your account has no district assigned.' });
            targetDistrict = user.district; // Force own district
        } else if (user?.role === 'SUPER_ADMIN') {
            if (!district) return res.status(400).json({ error: 'District is required for Super Admin.' });
        } else {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // 2. Validation
        if (!name || !code) {
            return res.status(400).json({ error: 'Name and Code are required.' });
        }

        const normalizedName = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const upperCode = code.toUpperCase().trim();

        // 3. Duplication Check (Name or Code in same District)
        const existing = await prisma.area.findFirst({
            where: {
                district: targetDistrict,
                OR: [
                    { normalizedName: normalizedName },
                    { code: upperCode }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ error: `Area with this Name or Code (${upperCode}) already exists in ${targetDistrict}.` });
        }

        // 4. Create
        const area = await prisma.area.create({
            data: {
                name,
                normalizedName,
                code: upperCode,
                pincode,
                district: targetDistrict,
                zone: zone || null, // Optional Zone
                isActive: true
            }
        });

        res.json(area);

    } catch (error) {
        console.error("Create Area Error:", error);
        res.status(500).json({ error: 'Failed to create area' });
    }
};
