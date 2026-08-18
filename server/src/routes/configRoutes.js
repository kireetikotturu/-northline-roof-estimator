import { Router } from 'express';
import { getPublicConfig } from '../controllers/configController.js';

const router = Router();
router.get('/', getPublicConfig);

export default router;
