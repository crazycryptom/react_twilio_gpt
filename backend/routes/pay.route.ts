import express from 'express';
import * as payController from '../controllers/pay.controller';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

router.use(authController.protect);
router.post('/create-checkout-session', payController.createCheckoutSession);
router.post('/create-portal-session', payController.createPortalSession);

export default router;
