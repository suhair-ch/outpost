
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { notifyParcelParticipants } from '../services/smsService';

const prisma = new PrismaClient();

// Create Manual Route
export const createRoute = async (req: AuthRequest, res: Response) => {
    try {
        const { routeName, driverId } = req.body;

        // Fetch driver for district
        const driver = await prisma.driver.findUnique({ where: { id: Number(driverId) } });
        if (!driver || !driver.district) return res.status(400).json({ error: 'Driver invalid or has no district' });

        const route = await prisma.route.create({
            data: {
                routeName,
                driverId: Number(driverId),
                district: driver.district, // STRICT STAMPING
                status: 'OPEN'
            }
        });
        res.json(route);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create route' });
    }
};

// Assign Parcel to Route
export const assignParcel = async (req: AuthRequest, res: Response) => {
    try {
        const { routeId, parcelId } = req.body;

        // Check if route is open
        const route = await prisma.route.findUnique({ where: { id: Number(routeId) } });
        if (!route || route.status !== 'OPEN') {
            return res.status(400).json({ error: 'Route not found or closed' });
        }

        const parcel = await prisma.parcel.update({
            where: { id: Number(parcelId) },
            data: {
                routeId: Number(routeId),
                status: 'DISPATCHED' // Update status when assigned
            }
        });

        // Notify
        await notifyParcelParticipants(parcel, `Parcel #${parcelId} Dispatched on Route #${routeId}.`);

        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign parcel' });
    }
};

// Close Route
export const closeRoute = async (req: AuthRequest, res: Response) => {
    try {
        const { routeId } = req.body;
        const route = await prisma.route.update({
            where: { id: Number(routeId) },
            data: { status: 'CLOSED' }
        });
        res.json(route);
    } catch (error) {
        res.status(500).json({ error: 'Failed to close route' });
    }
};

import { Role } from '../types';

// List Routes
export const listRoutes = async (req: AuthRequest, res: Response) => {
    try {
        const whereClause: any = {};
        const user = req.user;

        // If Driver, only show their assigned routes
        if (user?.role === Role.DRIVER) {
            const driver = await prisma.driver.findUnique({
                where: { mobile: user.mobile }
            });
            if (driver) {
                whereClause.driverId = driver.id;
            } else {
                return res.json([]); // No driver profile found
            }
        }

        // If District Admin, only show routes where driver is in their district
        if (user?.role === Role.DISTRICT_ADMIN) {
            if (!user.district) {
                return res.status(400).json({ error: 'District Admin has no assigned district' });
            }
            whereClause.district = user.district; // STRICT CHECK
        }

        const routes = await prisma.route.findMany({
            where: whereClause,
            include: {
                driver: true,
                parcels: {
                    include: { sourceShop: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
};

// Smart Suggestions: Get aggregated pending parcels by Zone
export const getRouteSuggestions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;

        if (user?.role !== 'DISTRICT_ADMIN' || !user.district) {
            return res.status(403).json({ error: 'Access denied or no district' });
        }

        // Aggregate BOOKED parcels by destinationZone
        const suggestions = await prisma.parcel.groupBy({
            by: ['destinationZone'],
            where: {
                destinationDistrict: user.district,
                status: 'BOOKED',
                destinationZone: { not: null }
            },
            _count: {
                id: true
            },
            orderBy: {
                destinationZone: 'asc'
            }
        });

        // Format result: [{ zone: 'Tirur', count: 12 }]
        const result = suggestions.map(s => ({
            zone: s.destinationZone,
            count: s._count.id
        }));

        res.json(result);

    } catch (error) {
        console.error('Smart Suggest Error:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
};
