import express from 'express';
import Inventory from '../models/addInventory.mjs';

const router = express.Router();

router.post('/addinventory', async (req, res) => {
  try {
    const { itemName, partNumber, category, quantityInStock, unitPrice, supplier } = req.body;

    const generatedPartNumber = partNumber && partNumber.trim() !== ''
      ? partNumber.trim().toUpperCase()
      : `PN-${Date.now().toString().slice(-6)}`;

    const inventoryItem = new Inventory({
      itemName,
      partNumber: generatedPartNumber,
      category,
      quantityInStock: Number(quantityInStock) || 0,
      unitPrice: Number(unitPrice) || 0,
      supplier
    });

    await inventoryItem.save();

    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect('/inventory');
    }

    return res.status(201).json({ success: true, message: 'Item added successfully.', data: inventoryItem });
  } catch (error) {
    console.error('Error saving inventory:', error);
    return res.status(400).json({ error: error.message });
  }
});

router.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

export default router;