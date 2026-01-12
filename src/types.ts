
import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        mobile: string;
        role: string;
        shopId?: number;
        district?: string;
    };
}

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    DISTRICT_ADMIN = 'DISTRICT_ADMIN',
    ADMIN = 'SUPER_ADMIN', // Alias
    SHOP = 'SHOP',
    DRIVER = 'DRIVER'
}
