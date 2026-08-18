import { Router } from 'express';
import { getAdminConfig, updateConfig, getLeads } from '../controllers/adminController.js';
import { requireOwnerAuth } from '../middleware/auth.js';

const router = Router();

// Every route below requires a valid owner JWT.
router.use(requireOwnerAuth);

router.get('/config', getAdminConfig);
router.put('/config', updateConfig);
router.get('/leads', getLeads);

export default router;
