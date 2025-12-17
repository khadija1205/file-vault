import { Router } from 'express';
import multer from 'multer';
import * as fileController from '../controllers/file';
import { authMiddleware } from '../middlewares/auth';
import { checkFileAccess } from '../middlewares/authorization';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});


router.use(authMiddleware);


router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getUserFiles);
router.delete('/:fileId', fileController.deleteFile);
router.get('/download/:fileId', checkFileAccess, fileController.downloadFile);



export default router;