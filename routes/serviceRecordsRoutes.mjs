import express from 'express';
import ServiceRecord from '../models/serviceRecords.mjs';
import AddNewCustomer from '../models/addNewCustomer.mjs';
import Inventory from '../models/addInventory.mjs';

const router = express.Router();

router.post('/api/servicerecords/complete', async (req, res) => {
  try {
    const { customerId, carName, numberPlate, serviceCategory, assignedTechnician, partsUsed, notes, totalCost } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required.' });
    }

    let formattedParts = [];

    if (Array.isArray(partsUsed)) {
      formattedParts = partsUsed.map(part => {
        if (typeof part === 'object' && part.item) {
          return { item: part.item, quantity: Number(part.quantity) || 1 };
        }
        return { item: part, quantity: 1 };
      }).filter(p => p.item && p.item !== 'none');
    } else if (typeof partsUsed === 'string' && partsUsed !== 'none' && partsUsed.trim() !== '') {
      formattedParts = [{ item: partsUsed, quantity: 1 }];
    }

    const record = new ServiceRecord({
      customerId,
      carName,
      numberPlate,
      serviceCategory,
      assignedTechnician,
      partsUsed: formattedParts,
      notes,
      totalCost: Number(totalCost)
    });

    await record.save();

    for (const part of formattedParts) {
      if (part.item) {
        await Inventory.findByIdAndUpdate(part.item, {
          $inc: { quantityInStock: -Math.abs(part.quantity) }
        });
      }
    }

    await AddNewCustomer.findByIdAndDelete(customerId);

    return res.status(200).json({ success: true, message: 'Service completed and inventory updated.' });
  } catch (error) {
    console.error('Error completing service record:', error);
    return res.status(500).json({ error: 'Failed to complete service record: ' + error.message });
  }
});

router.get('/api/servicerecords/history', async (req, res) => {
  try {
    const history = await ServiceRecord.find().sort({ completedDate: -1 });

    const populatedHistory = await Promise.all(
      history.map(async (doc) => {
        const record = doc.toObject();
        if (Array.isArray(record.partsUsed)) {
          record.partsUsed = await Promise.all(
            record.partsUsed.map(async (p) => {
              if (p && p.item && typeof p.item === 'string' && p.item.length === 24) {
                try {
                  const invItem = await Inventory.findById(p.item).select('itemName partNumber');
                  return { ...p, item: invItem || p.item };
                } catch (e) {
                  return p;
                }
              }
              return p;
            })
          );
        }
        return record;
      })
    );

    return res.status(200).json(populatedHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ error: 'Failed to fetch service history: ' + error.message });
  }
});

export default router;