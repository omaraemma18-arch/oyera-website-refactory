import express from 'express';
import Inventory from '../models/addInventory.mjs';

const router = express.Router();

router.post('/addinventory', async (req, res) => {
  console.log('incoming data', req.body);
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    console.log('Successfully saved to MongoDB:', newItem);
  } catch (err) {
    console.error('Error saving inventory:', err);
  }

  return res.redirect('/dashboard');
});

export default router;