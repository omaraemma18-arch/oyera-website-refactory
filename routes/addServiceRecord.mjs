import express from 'express';
import { createServiceRecord } from '../controllers/serviceRecordController.mjs';
import { requireAuth, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

// Technician logs completed work — materials used, labour fee, and total are
// calculated and stored server-side.
router.post('/api/service-records', requireAuth, requireRole('technician'), createServiceRecord);

export default router;
