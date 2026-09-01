import express from 'express';
import { listServiceRecords, createServiceRecord } from '../controllers/serviceRecordController.mjs';
import { requireAuth, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/api/service-records', requireAuth, listServiceRecords);
router.post('/api/service-records', requireAuth, requireRole('technician', 'admin'), createServiceRecord);

export default router;