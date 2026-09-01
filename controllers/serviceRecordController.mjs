import ServiceRecord from '../models/ServiceRecord.mjs';
import Customer from '../models/Customer.mjs';
import InventoryItem from '../models/InventoryItem.mjs';

// GET /api/service-records?search= — service history, visible to admin and technicians
export async function listServiceRecords(req, res) {
  try {
    const { search } = req.query;

    let records = await ServiceRecord.find({})
      .populate('customer', 'name phone vehiclePlate vehicleType')
      .populate('technician', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      const term = String(search).trim().toLowerCase();
      records = records.filter((r) => {
        return (
          r.customer?.name?.toLowerCase().includes(term) ||
          r.customer?.vehiclePlate?.toLowerCase().includes(term) ||
          r.technician?.name?.toLowerCase().includes(term)
        );
      });
    }

    res.json({ records });
  } catch {
    res.status(500).json({ error: 'Could not load service history. Please try again.' });
  }
}

// POST /api/service-records — technician submits completed work for a customer
export async function createServiceRecord(req, res) {
  try {
    const { customerId, workDone, materials, labourFee } = req.body;

    if (!customerId || !workDone || labourFee === undefined) {
      return res.status(400).json({ error: 'Please fill in the work done and labour fee.' });
    }
    if (Number(labourFee) < 0) {
      return res.status(400).json({ error: 'Labour fee cannot be negative.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const materialLines = [];
    let materialsCost = 0;

    if (Array.isArray(materials) && materials.length > 0) {
      for (const line of materials) {
        if (!line.itemId || !line.quantity) continue;
        const invItem = await InventoryItem.findById(line.itemId);
        if (!invItem) continue;

        const qty = Number(line.quantity);
        if (qty <= 0) continue;
        if (qty > invItem.quantity) {
          return res.status(400).json({
            error: `Not enough "${invItem.name}" in stock (have ${invItem.quantity}, need ${qty}).`,
          });
        }

        materialLines.push({
          item: invItem._id,
          name: invItem.name,
          quantity: qty,
          unitCost: invItem.unitCost,
        });
        materialsCost += qty * invItem.unitCost;
      }
    }

    const totalCost = materialsCost + Number(labourFee);

    const record = await ServiceRecord.create({
      customer: customer._id,
      technician: req.user.id,
      workDone,
      materialsUsed: materialLines,
      labourFee: Number(labourFee),
      materialsCost,
      totalCost,
    });

    // Deduct used materials from stock
    for (const line of materialLines) {
      await InventoryItem.findByIdAndUpdate(line.item, { $inc: { quantity: -line.quantity } });
    }

    customer.status = 'Completed';
    customer.assignedTechnician = req.user.id;
    await customer.save();

    const populated = await record.populate([
      { path: 'customer', select: 'name phone vehiclePlate vehicleType' },
      { path: 'technician', select: 'name' },
    ]);

    res.status(201).json({ record: populated });
  } catch {
    res.status(500).json({ error: 'Could not save the service record. Please try again.' });
  }
}
