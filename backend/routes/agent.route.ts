import express from 'express';
import * as agentController from './../controllers/agent.controller';
import * as userController from './../controllers/user.controller';
import * as authController from './../controllers/auth.controller';

const router = express.Router();


router.use(authController.protect)
router.get('/', userController.setUserIdtoQuery, agentController.getAllAgents);
router.post('/', userController.setUserIdtoBody, agentController.createAgent);
router.route('/:id')
.delete(agentController.deleteAgent)
.get(agentController.getAgent)
.put(agentController.updateAgentInformation)

// router.route('/:id/qalist')
// .post(agentController.postQAListHandler)


export default router;