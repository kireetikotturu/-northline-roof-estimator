import { Router } from 'express';
import { login, verify } from '../controllers/authController.js';
import { requireOwnerAuth } from '../middleware/auth.js';

const router = Router();
router.post('/login', login);
router.get('/verify', requireOwnerAuth, verify);

export default router;
