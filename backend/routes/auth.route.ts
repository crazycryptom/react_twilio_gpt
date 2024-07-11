import express from 'express';
import * as authController from '../controllers/auth.controller';


const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);

router.use(authController.protect);
router.post('/sign-out', authController.signOut);

export default router;