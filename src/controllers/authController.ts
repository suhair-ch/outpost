
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendSms } from '../services/smsService';
import { KERALA_DISTRICTS } from '../constants';

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

            // 1. Validate against strictly allowed list
            if (!KERALA_DISTRICTS.includes(district)) {
                return res.status(400).json({ error: `Invalid District. Must be one of: ${KERALA_DISTRICTS.join(', ')}` });
            }

            // 2. Ensure ONE Admin per District
            const existingAdmin = await prisma.user.findFirst({
                where: {
                    role: 'DISTRICT_ADMIN',
                    district: district
                }
            });

            if (existingAdmin) {
                return res.status(400).json({ error: `An Admin for ${district} already exists (${existingAdmin.mobile}). Only 1 per district allowed.` });
            }
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
    const otp = '1234'; // For MVP we are keeping static OTP
    await sendSms(mobile, `Your Login OTP is: ${otp}`);
    res.json({ message: 'OTP sent', otp });
};

// Unified Login (OTP or Password)
export const login = async (req: AuthRequest, res: Response) => {
    const { mobile, password, otp } = req.body;
    console.log(`Login Attempt: Mobile=${mobile}`);

    if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });

    try {
        const user = await prisma.user.findUnique({ where: { mobile } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Authentication Logic
        if (user.status === 'INVITED') {
            return res.status(403).json({ error: 'REQUIRE_SETUP', message: 'Account requires setup.' });
        }

        if (!password) return res.status(400).json({ error: 'Password is required' });

        const valid = await bcrypt.compare(password, user.password || '');
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        // Fetch Shop ID if applicable
        let shopId: number | undefined;
        if (user.role === 'SHOP') {
            const shop = await prisma.shop.findUnique({ where: { mobileNumber: mobile } });
            if (shop) shopId = shop.id;
        }

        const token = jwt.sign(
            {
                id: user.id,
                userId: user.id, // Legacy compatibility
                role: user.role,
                district: user.district,
                shopId: shopId
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user, role: user.role, shopId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const verifyOtpAndSetPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { mobile, otp, password } = req.body;

        // Mock OTP Check
        if (otp !== '1234') {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const user = await prisma.user.findUnique({ where: { mobile } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.status !== 'INVITED') {
            return res.status(400).json({ error: 'Account is already active. Please login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
            where: { mobile },
            data: {
                status: 'ACTIVE',
                password: hashedPassword
            }
        });

        // Fetch Shop ID for Token link
        let shopId: number | undefined;
        if (updatedUser.role === 'SHOP') {
            const shop = await prisma.shop.findUnique({ where: { mobileNumber: mobile } });
            if (shop) shopId = shop.id;
        }

        const token = jwt.sign(
            {
                id: updatedUser.id,
                userId: updatedUser.id,
                role: updatedUser.role,
                district: updatedUser.district,
                shopId
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: updatedUser, role: updatedUser.role, shopId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Setup failed' });
    }
};

export const verifyOtp = async (req: AuthRequest, res: Response) => {
    // Reusing login logic for consistency, but this endpoint specifically implies OTP
    req.body.otp = req.body.otp || '1234'; // Mock
    return login(req, res);
};

// Check Invite Status
export const checkInvite = async (req: AuthRequest, res: Response) => {
    const { mobile } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { mobile } });

        if (!user) {
            return res.status(404).json({ error: 'No invite found for this number.' });
        }

        if (user.status !== 'INVITED') {
            return res.status(400).json({ error: 'Account already active. Please Login.' });
        }

        // Return safe info for the frontend to adapt the form
        res.json({
            role: user.role,
            mobile: user.mobile,
            district: (user as any).district,
            name: (user as any).name
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check invite' });
    }
};

// Smart Shop/User Sign Up (Legacy/Driver Public Signup)
export const signup = async (req: AuthRequest, res: Response) => {
    const { shopName, ownerName, mobile, password, district } = req.body;

    // Basic Validation
    if (!mobile || !password) {
        return res.status(400).json({ error: 'Mobile and Password are required' });
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { mobile } });

        // Strict Invite Check
        if (!existingUser) {
            return res.status(403).json({ error: 'Access Denied: You are not invited. Please contact Admin.' });
        }

        if (existingUser.status !== 'INVITED') {
            return res.status(400).json({ error: 'Account already active. Please Login.' });
        }

        // Role-Specific Validation
        if (existingUser.role === 'SHOP') {
            if (!shopName || !ownerName) {
                return res.status(400).json({ error: 'Shop Name and Owner Name are required for Shops.' });
            }
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Activate User + Create Shop (if needed)
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

            let shop = null;

            // ONLY Create Shop if role is SHOP
            if (user.role === 'SHOP') {
                // Ensure district consistency from Invite
                const finalDistrict = (user as any).district || district || 'Unknown';
                console.log('Creating Shop with District:', finalDistrict);

                // Generate Shop Code
                const distCode = (finalDistrict || 'KER').substring(0, 3).toUpperCase();
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const shopCode = `${distCode}-SHP-${randomSuffix}`;

                shop = await tx.shop.create({
                    data: {
                        shopCode,
                        shopName, // Guaranteed by validation above
                        ownerName, // Guaranteed by validation above
                        mobileNumber: mobile, // Link by mobile
                        district: finalDistrict,
                        commission: 0.0
                    }
                });
                console.log('Shop Created:', shop.id);
            } else {
                console.log('Skipping Shop creation for role:', user.role);
            }

            return { user, shop };
        });

        // Auto-Login
        const tokenPayload: any = {
            userId: result.user.id,
            mobile: result.user.mobile,
            role: result.user.role,
        };

        if (result.shop) {
            tokenPayload.shopId = result.shop.id;
        }

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: result.user, shop: result.shop, shopId: result.shop?.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed', details: (error as any).message });
    }
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) return res.status(404).json({ error: 'User not found' });

        // Verify Old
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Incorrect current password' });

        // Hash New
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};
