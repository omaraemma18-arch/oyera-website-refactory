import addInventory from '../models/addInventory.mjs';

export const createInventoryItem = async (req, res) => {
  try {
    const { itemName, category, supplier, cost, quantity } = req.body;

    const newInventoryItem = new addInventory({
      itemName,
      category,
      supplier,
      cost: Number(cost),
      quantity: Number(quantity)
    });

    await newInventoryItem.save();
    return res.redirect('/inventory');
  } catch (err) {
    console.error('Error adding inventory item:', err);
    return res.status(500).send('Server error: Unable to add inventory item.');
  }
};


export const getInventoryItems = async (req, res) => {
  try {
    const items = await addInventory.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('Error fetching inventory items:', err);
    return res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
};