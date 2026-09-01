import InventoryItem from '../models/InventoryItem.mjs';

// GET /api/inventory?search= — any logged-in staff can view
export async function listInventory(req, res) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.name = new RegExp(String(search).trim(), 'i');
    }
    const items = await InventoryItem.find(filter).sort({ name: 1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Could not load inventory. Please try again.' });
  }
}

// GET /api/inventory/:id
export async function getInventoryItem(req, res) {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json({ item });
  } catch {
    res.status(404).json({ error: 'Item not found.' });
  }
}

// POST /api/inventory — admin only
export async function createInventoryItem(req, res) {
  try {
    const { name, category, supplier, unitCost, quantity } = req.body;
    if (!name || unitCost === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, unit cost, and quantity are required.' });
    }
    if (Number(unitCost) < 0 || Number(quantity) < 0) {
      return res.status(400).json({ error: 'Cost and quantity cannot be negative.' });
    }

    const item = await InventoryItem.create({
      name,
      category,
      supplier,
      unitCost: Number(unitCost),
      quantity: Number(quantity),
    });
    res.status(201).json({ item });
  } catch {
    res.status(500).json({ error: 'Could not add the item. Please try again.' });
  }
}

// PUT /api/inventory/:id — admin only
export async function updateInventoryItem(req, res) {
  try {
    const { name, category, supplier, unitCost, quantity } = req.body;
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { name, category, supplier, unitCost, quantity },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json({ item });
  } catch {
    res.status(500).json({ error: 'Could not update the item. Please try again.' });
  }
}

// DELETE /api/inventory/:id — admin only
export async function deleteInventoryItem(req, res) {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not delete the item. Please try again.' });
  }
}
