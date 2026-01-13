
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendSms } from '../services/smsService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Create User (District Admin or other roles)
export const inviteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { mobile, name, district, role } = req.body;
        const currentUserRole = req.user?.role;
        const userDistrict = (req.user as any)?.district;

        // Strict Role Hierarchy Implementation
        let finalDistrict = district;

        if (currentUserRole === 'SHOP') {
            return res.status(403).json({ error: 'Shops are not authorized to invite users.' });
        }

        if (currentUserRole === 'SUPER_ADMIN') {
            if (role !== 'DISTRICT_ADMIN') {
                return res.status(403).json({ error: 'Super Admin can ONLY invite District Admins.' });
            }
            if (!district) {
                return res.status(400).json({ error: 'District is required when inviting a District Admin.' });
            }
            // finalDistrict remains as passed in body
        }

        if (currentUserRole === 'DISTRICT_ADMIN') {
            if (role !== 'SHOP') {
                return res.status(403).json({ error: 'District Admin can ONLY invite Shops.' });
            }

            // Strict Inheritance: DA cannot let user choose district
            if (!userDistrict) {
                return res.status(500).json({ error: 'Your account does not have a valid District assigned.' });
            }
            finalDistrict = userDistrict;
        }

        // Check availability
        const existing = await prisma.user.findUnique({ where: { mobile } });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create Invite (Placeholder password, Status INVITED)
        const hashedPassword = await bcrypt.hash('1234', 10); // Standard placeholder

        const user = await prisma.user.create({
            data: {
                mobile,
                role: role,
                district: finalDistrict, // Important for Shop claim
                status: 'INVITED',
                password: hashedPassword,
                otp: null
            }
        });

        res.json({ message: 'User invited successfully. They can now Sign Up.', user });
    } catch (error) {
        console.error("Invite Error:", error);
        res.status(500).json({ error: 'Failed to create invite' });
    }
};

export const sendOtp = async (req: AuthRequest, res: Response) => {
    const { mobile } = req.body;
    const otp = '1234'; // For MVP we are keeping static OTP, but in real life we would generate random

    // In production we would generate random: Math.floor(1000 + Math.random() * 9000).toString();

    await sendSms(mobile, `Your Login OTP is: ${otp}`);
    res.json({ message: 'OTP sent', otp });
};

// Unified Login (OTP or Password)
export const login = async (req: AuthRequest, res: Response) => {
    const { mobile, password, otp } = req.body; // Removed 'role' from input
    console.log(`Login Attempt: Mobile=${mobile}, OTP=${otp}, Pass=${password ? 'YES' : 'NO'}`);

    if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    try {
        // Find user
        let user = await prisma.user.findUnique({ where: { mobile } });

        if (!user) {
            console.log('User Lookup Result: NOT FOUND for', mobile, 'in DB');
            return res.status(404).json({ error: 'User not found. Please Sign Up or ask Admin.' });
        }
        console.log('User Lookup Result: FOUND', user.id, user.role);

        // Authentication Logic
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // Strict Password Check
        if (!user.password) {
            return res.status(400).json({ error: 'Account not set up for password login. Contact Admin.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        let shopId: number | undefined;

        if (user.role === 'SHOP') {
            const shop = await prisma.shop.findUnique({
                where: { mobileNumber: mobile }
            });
            if (shop) {
                shopId = shop.id;
            }
        }

        const token = jwt.sign(
            {
                userId: user.id,
                mobile: user.mobile,
                role: user.role,
                shopId,
                district: (user as any).district // Add district to token
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return detected role to frontend
        res.json({ token, user, shopId, role: user.role, district: (user as any).district });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const verifyOtp = async (req: AuthRequest, res: Response) => {
    // Reusing login logic for consistency, but this endpoint specifically implies OTP
    req.body.otp = req.body.otp || '1234'; // Mock
    return login(req, res);
};

// NEW: Invite User (Admin/DA only)
// Duplicate function removed

// Updated: Shop Sign Up (Invite Claim)
export const signup = async (req: AuthRequest, res: Response) => {
    const { shopName, ownerName, mobile, password, district } = req.body;

    if (!mobile || !password || !shopName || !ownerName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { mobile } });

        // Strict Invite Check
        if (!existingUser) {
            return res.status(403).json({ error: 'Access Denied: You are not invited. Please contact Admin.' });
        }

        if (existingUser.status !== 'INVITED') {
            // If already ACTIVE, checking if they are trying to double register
            if (existingUser.role === 'SHOP') {
                // Check if Shop exists
                const shopExists = await prisma.shop.findUnique({ where: { mobileNumber: mobile } });
                if (shopExists) return res.status(400).json({ error: 'Account already active. Please Login.' });
                // If User is active but no Shop (rare edge case), proceed? No, assume consistency.
                return res.status(400).json({ error: 'Account already active. Please Login.' });
            }
            return res.status(400).json({ error: 'Account already active. Please Login.' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Activate User + Create Shop
        console.log('Starting Signup Transaction...');
        const result = await prisma.$transaction(async (tx) => {
            console.log('Updating User...');
            const user = await tx.user.update({
                where: { mobile },
                data: {
                    password: hashedPassword,
                    status: 'ACTIVE'
                }
            });
            console.log('User Updated:', user.mobile);

            // Ensure district consistency from Invite
            const finalDistrict = (user as any).district || district || 'Unknown';
            console.log('Creating Shop with District:', finalDistrict);

            // Generate Shop Code
            const distCode = (finalDistrict || 'KER').substring(0, 3).toUpperCase();
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const shopCode = `${distCode}-SHP-${randomSuffix}`;

            const shop = await tx.shop.create({
                data: {
                    shopCode,
                    shopName,
                    ownerName,
                    mobileNumber: mobile, // Link by mobile
                    district: finalDistrict,
                    commission: 0.0
                }
            });
            console.log('Shop Created:', shop.id);

            return { user, shop };
        });

        // Auto-Login
        const token = jwt.sign(
            { userId: result.user.id, mobile: result.user.mobile, role: result.user.role, shopId: result.shop.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: result.user, shop: result.shop, shopId: result.shop.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed', details: (error as any).message });
    }
};
