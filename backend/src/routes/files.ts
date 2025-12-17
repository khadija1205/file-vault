import { Router } from 'express';
import multer from 'multer';
import * as fileController from '../controllers/file';
import { authMiddleware } from '../middlewares/auth';
import { checkFileAccess } from '../middlewares/authorization';
import { validateRequest } from '../utils/validation';
import { shareFileSchema } from '../schemas/file';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

router.get('/link/:shareLink', fileController.accessShareLink);

router.use(authMiddleware);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.post('/bulk-upload', upload.array('files', 10), fileController.bulkUploadFiles);
router.get('/', fileController.getUserFiles);
router.delete('/:fileId', fileController.deleteFile);
router.get('/download/:fileId', checkFileAccess, fileController.downloadFile);
router.post('/share', validateRequest(shareFileSchema), fileController.shareFileWithUsers);
router.get('/shared-with-me', fileController.getSharedWithMeFiles);
router.post('/generate-link', fileController.generateShareLink);


export default router;
