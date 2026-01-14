
import { Router } from 'express';
import { authenticate, requireRole } from './middleware/auth';
import * as shopController from './controllers/shopController';
import * as parcelController from './controllers/parcelController';
import * as driverController from './controllers/driverController';
import * as routeController from './controllers/routeController';
import * as settlementController from './controllers/settlementController';
import * as dashboardController from './controllers/dashboardController';
import * as authController from './controllers/authController';
import { trackParcel } from './controllers/trackingController';
import * as areaController from './controllers/areaController';
import { Role } from './types';

const router = Router();

// Auth
router.post('/login', authController.login);
router.post('/auth/signup', authController.signup);
router.post('/auth/invite', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), authController.inviteUser);
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.get('/public/track/:id', trackParcel);

// Shops
router.post('/shops', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), shopController.createShop);
router.get('/shops', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), shopController.listShops);
// Legacy/Duplicate removed

// Drivers
router.post('/drivers', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), driverController.createDriver);
router.get('/drivers', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), driverController.listDrivers);

// Parcels
router.post('/parcels', authenticate, requireRole([Role.SHOP, Role.ADMIN, Role.DISTRICT_ADMIN]), parcelController.bookParcel);
router.get('/parcels', authenticate, requireRole([Role.SHOP, Role.ADMIN, Role.DISTRICT_ADMIN, Role.DRIVER]), parcelController.listParcels);
router.get('/parcels/:id', authenticate, parcelController.getParcelById);
// Support both PATCH and POST for status updates
router.post('/parcels/update-status', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN, Role.DRIVER]), (req, res) => {
    req.params.id = req.body.parcel_id;
    parcelController.updateParcelStatus(req, res);
});
router.patch('/parcels/:id/status', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN, Role.DRIVER]), parcelController.updateParcelStatus);

// Delivery (OTP)
router.post('/parcels/generate-delivery-otp', authenticate, requireRole([Role.DRIVER, Role.ADMIN, Role.DISTRICT_ADMIN]), parcelController.generateDeliveryOtp);
router.post('/parcels/verify-delivery', authenticate, requireRole([Role.DRIVER, Role.ADMIN, Role.DISTRICT_ADMIN, Role.SHOP]), parcelController.verifyDelivery);
router.post('/parcels/:id/resend-otp', authenticate, requireRole([Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.SHOP]), parcelController.resendOtp);

// Routes
router.post('/routes/create', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), routeController.createRoute);
router.post('/routes/assign-parcel', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), routeController.assignParcel);
router.post('/routes/close', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), routeController.closeRoute);
router.get('/routes', authenticate, requireRole([Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.DRIVER]), routeController.listRoutes);

// Settlements
router.get('/shops/:shopId/earnings', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN, Role.SHOP]), settlementController.getShopEarnings);
router.post('/settlements/mark-paid', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), settlementController.markPaid);

// Dashboard
router.get('/dashboard/today', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), dashboardController.getDailyStats);
router.get('/dashboard/districts', authenticate, requireRole([Role.ADMIN, Role.DISTRICT_ADMIN]), dashboardController.getDistrictStats); // Allow District Admin (scoped)

// Locations (Public or Auth?) - Let's make it public for Signup, or Auth for internal? Signup needs it public.
router.get('/locations/districts', areaController.getDistricts);
router.get('/locations/areas', areaController.getAreas);
router.post('/locations/areas', authenticate, requireRole([Role.SUPER_ADMIN, Role.DISTRICT_ADMIN]), areaController.createArea);


export default router;
