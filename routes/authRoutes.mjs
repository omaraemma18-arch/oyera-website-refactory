import express from 'express';
import { login, registerTechnician, me, listTechnicians } from '../controllers/authController.mjs';
import { requireAuth, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.post('/api/auth/login', login);
router.post('/api/auth/register-technician', requireAuth, requireRole('admin'), registerTechnician);
router.get('/api/auth/me', requireAuth, me);
router.get('/api/auth/technicians', requireAuth, requireRole('admin'), listTechnicians);

export default router;
