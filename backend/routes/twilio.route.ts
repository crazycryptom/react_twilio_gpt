import express from 'express';
import * as twilioController from '../controllers/twilio.controller';
import * as userController from '../controllers/user.controller';


const router = express.Router();

router.post('/make-call', twilioController.handleMakingCall);
router.post('/voice', twilioController.handleIncomingCall);
router.post('/no-answer', twilioController.handleNoAnswer);
router.post('/voicemail', twilioController.handleVoiceMail);
// router.post('/sms', twilioController.handleConversation);
router.post('/search-numbers', twilioController.searchTwilioNumber);
router.post('/buy-number', twilioController.buyTwilioNumber);
router.post('/delete-number', twilioController.deleteNumberFromTwilio, twilioController.deleteNumber);
router.post('/save-number', userController.setUserIdtoBody, twilioController.handleSaveNumber);
router.get('/get-numbers', userController.setUserIdtoQuery, twilioController.getNumbers);
router.post('/validate-number', twilioController.handleValidation);
export default router;
