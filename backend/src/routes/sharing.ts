import { Router } from 'express';
import * as sharingController from '../controllers/sharing';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../utils/validation';
import { shareFileSchema, generateLinkSchema } from '../schemas/file';

const router = Router();

router.post('/share-user', authMiddleware, validateRequest(shareFileSchema), sharingController.shareWithUser);

router.post('/generate-link', authMiddleware, validateRequest(generateLinkSchema), sharingController.generateShareLink);

router.get('/link/:shareLink', sharingController.accessSharedFile);
router.delete('/:shareId', authMiddleware, sharingController.revokeShare);

export default router;
