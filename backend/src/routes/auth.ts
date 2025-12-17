import { Router } from 'express';
import * as authController from '../controllers/auth';
import { validateRequest } from '../utils/validation';
import { registerSchema, loginSchema } from '../schemas/auth';
import { authMiddleware } from '../middlewares/auth';


const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/search', authMiddleware, authController.searchUserByEmail);


export default router;