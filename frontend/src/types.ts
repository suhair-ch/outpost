export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN', // Formerly ADMIN, now HQ
    DISTRICT_ADMIN: 'DISTRICT_ADMIN',
    SHOP: 'SHOP',
    DRIVER: 'DRIVER',
    ADMIN: 'SUPER_ADMIN' // Backward compatibility alias? Or just remove? Let's keep for now mapping to SUPER.
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
    id: number;
    mobile: string;
    role: Role;
    shopId?: number;
}
