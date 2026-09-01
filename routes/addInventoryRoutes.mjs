import express from 'express';
import {
  listInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController.mjs';
import { requireAuth, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/api/inventory', requireAuth, listInventory);
router.get('/api/inventory/:id', requireAuth, getInventoryItem);
router.post('/api/inventory', requireAuth, requireRole('admin'), createInventoryItem);
router.put('/api/inventory/:id', requireAuth, requireRole('admin'), updateInventoryItem);
router.delete('/api/inventory/:id', requireAuth, requireRole('admin'), deleteInventoryItem);

export default router;
