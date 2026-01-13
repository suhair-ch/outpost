import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

// Get Areas by District
export const getAreas = async (req: Request, res: Response) => {
    try {
        const { district } = req.query;

        if (!district || typeof district !== 'string') {
            return res.status(400).json({ error: 'District parameter is required' });
        }

        const areas = await prisma.area.findMany({
            where: {
                district,
                isActive: true // Only Active Areas
            },
            orderBy: { name: 'asc' } // Alphabetical Sort
        });

        res.json(areas);
    } catch (error) {
        console.error("Get Areas Error:", error);
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
};
