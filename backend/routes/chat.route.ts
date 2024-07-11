import express from 'express';
import * as chatController from '../controllers/chat.controller';
import * as userController from '../controllers/user.controller';
import * as authController from '../controllers/auth.controller';


const router = express.Router();

router.use(authController.protect);
router.get('/', userController.setUserIdtoQuery, chatController.getAllChats);
router.route('/:id')
    .delete(chatController.deleteChat)

export default router;