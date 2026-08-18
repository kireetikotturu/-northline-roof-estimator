import { Router } from 'express';
import { submitEstimate } from '../controllers/estimateController.js';

const router = Router();
router.post('/', submitEstimate);

export default router;
