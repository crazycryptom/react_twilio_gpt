import express from 'express'
import * as uploadController from '../controllers/upload.controller'
import * as agentController from '../controllers/agent.controller'
import * as authController from '../controllers/auth.controller'

const router = express.Router()

router.use(authController.protect)
router.route('/:agentId')
.post( uploadController.uploadMiddleware, agentController.setAgentIdtoBody, uploadController.handleEmbeddings, uploadController.createMetaData)
.get(agentController.setAgentIdtoQuery, uploadController.getUploadedFiles)

router.delete('/:id', uploadController.deleteMetaData)
export default router