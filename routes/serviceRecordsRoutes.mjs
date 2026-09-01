import express from 'express';
import { listServiceRecords } from '../controllers/serviceRecordController.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const router = express.Router();

// Service history — visible to both admin and technicians
router.get('/api/service-records', requireAuth, listServiceRecords);

export default router;
