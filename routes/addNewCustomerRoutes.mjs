import express from 'express';
import {
  listCustomers,
  customerStats,
  getCustomer,
  createCustomer,
  claimCustomer,
} from '../controllers/customerController.mjs';
import { requireAuth, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/api/customers', requireAuth, listCustomers);
router.get('/api/customers/stats', requireAuth, customerStats);
router.get('/api/customers/:id', requireAuth, getCustomer);
router.post('/api/customers', requireAuth, requireRole('admin'), createCustomer);
router.put('/api/customers/:id/claim', requireAuth, requireRole('technician'), claimCustomer);

export default router;
