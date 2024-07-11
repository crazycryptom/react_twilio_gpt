import express from 'express';
import * as gptController from '../controllers/gpt.controller';
import * as authController from '../controllers/auth.controller';
import * as uploadController from '../controllers/upload.controller';

const router = express.Router();

router.use(authController.protect);
// router.post('/gpt-tuned-reply', gptController.getReplyFromTuned)
router.post('/gpt-pure-reply', uploadController.getAnswer)
router.post('/get-qalist/:flag', gptController.getQAListHandler)

export default router;