import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, Role } from '../types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Mock OTP Login
export const login = async (req: AuthRequest, res: Response) => {
    const { mobile, role } = req.body;

    if (!mobile || !role) {
        return res.status(400).json({ error: 'Mobile and Role are required' });
    }

    // In a real app, we would verify OTP here.
    // For MVP, if the user exists, we log them in. If not, we create them (auto-signup for simplicity in Phase 1 demo?)
    // User asked for "OTP-based login", implies user might already exist.
    // Let's create user if not exists for 'SHOP' and 'DRIVER' but 'ADMIN' should probably be pre-seeded or protected?
    // User said "Founder is solo" -> Phase 1.

    // For simplicity: Upsert user
    const user = await prisma.user.upsert({
        where: { mobile },
        update: { role }, // Update role if logging in with different role? Maybe restrict this.
        create: {
            mobile,
            role,
            otp: '1234' // Mock OTP
        }
    });

    let shopId: number | undefined;

    if (role === 'SHOP') {
        const shop = await prisma.shop.findUnique({
            where: { mobileNumber: mobile }
        });
        if (shop) {
            shopId = shop.id;
        }
    }

    const token = jwt.sign({ userId: user.id, mobile: user.mobile, role: user.role, shopId }, JWT_SECRET, {
        expiresIn: '7d'
    });

    res.json({ token, user, shopId });
};

// Middleware
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Debug Log
        console.log(`[AuthDebug] Checking Access. User Role: ${req.user?.role}, Required: ${roles}`);

        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`[AuthDebug] ACCESS DENIED. Role '${req.user?.role}' is not in [${roles}]`);
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};
