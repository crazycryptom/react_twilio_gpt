import express from 'express';
import * as userController from './../controllers/user.controller';
import * as authController from './../controllers/auth.controller';

const router = express.Router();

// Use protect middleware
router.use(authController.protect);
// router.post('/', userController.createUser);

router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);

export default router;